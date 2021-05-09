import {Component, OnInit, ViewChild} from '@angular/core';
import {JsonValidateService} from '../services/json-validate.service';
import {QueryService} from '../services/query.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import * as exampleDocument from '../../assets/example.json';
import {Router} from '@angular/router';
import {SearchQuery} from '../utils/query.utils';

@Component({
  selector: 'app-init',
  templateUrl: './init.component.html',
  styleUrls: ['./init.component.scss']
})
export class InitComponent implements OnInit {
  insertingText = false;
  insertedText: string;
  jsonFile: File;
  validating: boolean;

  @ViewChild('jsonTextarea') jsonTextarea: HTMLTextAreaElement;

  constructor(
    private queryService: QueryService,
    private jsonValidateService: JsonValidateService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {

  }

  handleTextUpload(e: any): void{
    this.validating = true;
    this.validateText().then(res => {
      this.validating = false;
      this.setQuery(res);
    }).catch(err => {
      this.validating = false;
      this.snackBar.open(
        'Couldn\'t parse the text!',
        '',
        {
          panelClass: ['red-snackbar'],
          duration: 5000
        }
      );
    });
  }

  handleFileUpload(e: any): void{
    this.validating = true;
    const files = e?.target?.files;
    if (files?.length !== 1) {
      return;
    }
    this.jsonFile = files[0];

    this.validateUploadedFile().then(res => {
      this.validating = false;
      this.setQuery(res);
    }).catch(err => {
      this.jsonFile = undefined;
      this.validating = false;
      this.snackBar.open(
        'Couldn\'t parse the file!',
        '',
        {
          panelClass: ['red-snackbar'],
          duration: 5000
        }
      );
    });
  }

  validateText(): Promise<SearchQuery>{
    return new Promise<SearchQuery>((resolve, reject) => {
      if (this.insertedText){
        try{
          const parsed = JSON.parse(this.insertedText);
          if (this.jsonValidateService.validateQuery(parsed)){
            resolve(parsed);
          } else {
            reject();
          }
        } catch (e) {
          reject(e);
        }
      } else {
        reject();
      }
    });
  }

  validateUploadedFile(): Promise<SearchQuery>{
   return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.readAsBinaryString(this.jsonFile);

      fileReader.onloadend = () => {
        if (fileReader.result) {
          try{
            const parsed = JSON.parse(fileReader.result as string);
            if (this.jsonValidateService.validateQuery(parsed)){
              resolve(parsed);
            } else {
              reject();
            }
          } catch (e) {
            reject(e);
          }
        }
      };
    });
  }

  setQuery(query: SearchQuery): void{
    this.queryService.setQuery(query);
    this.router.navigate(['/map']);
  }

  loadExample(): void{
    this.setQuery((exampleDocument as any).default);
  }

}
