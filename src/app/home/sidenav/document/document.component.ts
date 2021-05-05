import {Component, Input, OnInit} from '@angular/core';
import {SelectedDocument} from '../sidenav.component';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss']
})
export class DocumentComponent implements OnInit {

  @Input() document: SelectedDocument;
  @Input() highlightedWords: string[];
  @Input() hoveredWord: string;

  constructor() { }

  ngOnInit(): void {

  }

}
