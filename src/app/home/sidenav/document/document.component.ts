import {Component, Input, OnInit} from '@angular/core';
import {SelectedDocument} from '../sidenav.component';
import {WordMap} from '../../comparison/comparison.component';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss']
})
export class DocumentComponent implements OnInit {

  @Input() document: SelectedDocument;
  @Input() highlightedExactMatches: Set<string>;
  @Input() highlightedSoftMatches: Set<string>;
  @Input() highlightedWordMap: WordMap;
  @Input() hoveredWord: string;

  constructor() { }

  ngOnInit(): void {

  }

}
