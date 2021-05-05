import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {SearchQuery} from '../../services/query.service';
import {WordSet} from '../comparison/comparison.component';

export interface SelectedDocument{
  id: string;
  title: string;
  subtitle: string;
  content: string;
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  @Input() selectedDocuments: SelectedDocument[] = [];
  @Input() comparingWindowOpen = false;
  @Input() searchQuery: SearchQuery;
  @Output() sidebarClose = new EventEmitter<any>();
  @Output() compareClick = new EventEmitter<any>();

  compareWindow = false;
  highlightedWords: string[];
  hoveredWord: string;

  constructor() { }

  ngOnInit(): void {
  }

  closeSidenav($event: MouseEvent): void {
    this.sidebarClose.emit($event);
    this.clearHighlightedWords();
  }

  clickedCompare($event: MouseEvent): void {
    this.compareClick.emit($event);
    this.clearHighlightedWords();
  }

  handleWordsChanged(wordSet: WordSet): void{
    this.highlightedWords = Array.from(wordSet.keys());
  }

  clearHighlightedWords(): void{
    this.highlightedWords = [];
  }

  handleWordHovered(word: string): void{
    this.hoveredWord = word;
  }
}
