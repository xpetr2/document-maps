import {Component, ViewChild} from '@angular/core';
import {JsonValidateService} from '../services/json-validate.service';
import {QueryService} from '../services/query.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import * as exampleDocument from '../../assets/example.json';
import {Router} from '@angular/router';
import {Corpus} from '../utils/query.utils';

/**
 * The initial welcoming component of the application, asking for the corpus to be inserted
 */
@Component({
  selector: 'app-init',
  templateUrl: './init.component.html',
  styleUrls: ['./init.component.scss']
})
export class InitComponent {
  /**
   * A flag, saying whether has selected to enter JSON as text
   */
  insertingText = false;
  /**
   * A value, holding the inserted text
   */
  insertedText: string;
  /**
   * The file inserted in
   */
  jsonFile: File;
  /**
   * A flag, specifying whether the validation service is currently validating the file/text
   */
  validating: boolean;

  /**
   * The reference to the textarea when inserting the corpus as text
   */
  @ViewChild('jsonTextarea') jsonTextarea: HTMLTextAreaElement;

  /**
   * @param queryService          The QueryService used to store the corpus once loaded
   * @param jsonValidateService   The validation service used to validate the inserted file/text
   * @param snackBar              The snackbar, showing error messages
   * @param router                The router responsible for the navigation
   */
  constructor(
    private queryService: QueryService,
    private jsonValidateService: JsonValidateService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  /**
   * The event handler function responsible for validating and setting the inserted text
   */
  handleTextUpload(): void{
    this.validating = true;
    this.validateText().then(res => {
      this.validating = false;
      this.setQuery(res);
    }).catch(err => {
      this.displayError('Couldn\'t parse the file!');
    });
  }

  /**
   * The event handler function responsible for validating the inserted file and sending it
   * @param e The input change event
   */
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
      this.displayError('Couldn\'t parse the file!');
    });
  }

  /**
   * A function displaying an error message in the snackbar
   * @param msg The message to be displayed
   */
  displayError(msg: string): void{
    this.jsonFile = undefined;
    this.validating = false;
    this.snackBar.open(
      msg,
      '',
      {
        panelClass: ['red-snackbar'],
        duration: 5000
      }
    );
  }

  /**
   * A promise responsible for validating the inserted text
   */
  validateText(): Promise<Corpus>{
    return new Promise<Corpus>((resolve, reject) => {
      this.validateAndParse(this.insertedText, resolve, reject);
    });
  }

  /**
   * A promise responsible for validating the inserted file
   */
  validateUploadedFile(): Promise<Corpus>{
   return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsBinaryString(this.jsonFile);
      fileReader.onloadend = () => {
        this.validateAndParse(fileReader.result as string, resolve, reject);
      };
    });
  }

  /**
   * The validation and parsing wrapper of a given text
   * @param text    The text to be validated
   * @param resolve The function to be called if successful
   * @param reject  The function to be called if unsuccessful
   */
  validateAndParse(text: string, resolve: any, reject: any): void{
    if (text) {
      try{
        const parsed = JSON.parse(text);
        if (this.jsonValidateService.validateCorpus(parsed)){
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
  }

  /**
   * Sets the processed corpus to QueryService
   * @param corpus  The corpus that will be set
   */
  setQuery(corpus: Corpus): void{
    this.queryService.setCorpus(corpus);
    this.router.navigate(['/map']);
  }

  /**
   * Loads the example document
   */
  loadExample(): void{
    this.setQuery((exampleDocument as any).default);
  }

}
