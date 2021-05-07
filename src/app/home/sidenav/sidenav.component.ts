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
  highlightedExactMatches: string[];
  highlightedSoftMatches: string[];
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
    this.highlightedExactMatches = Array.from(wordSet.keys());
    const softMatches = Array.from(wordSet.values())
      .reduce((a, c) => a.concat([...c]), [])
      .filter(a => !this.highlightedExactMatches.includes(a));
    this.highlightedSoftMatches = Array.from(new Set(softMatches));
  }

  clearHighlightedWords(): void{
    this.highlightedExactMatches = [];
  }

  handleWordHovered(word: string): void{
    this.hoveredWord = word;
  }
}
