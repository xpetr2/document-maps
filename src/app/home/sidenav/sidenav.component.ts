import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
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
  highlightedExactMatches = new Set<string>();
  highlightedSoftMatches = new Set<string>();
  highlightedWordSet: WordSet = new Map<string, Set<string>>();
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
    this.highlightedExactMatches = new Set<string>(wordSet.keys());
    const softMatches = Array.from(wordSet.values())
      .reduce((a, c) => a.concat([...c]), [])
      .filter(a => !this.highlightedExactMatches.has(a));
    this.highlightedSoftMatches = new Set(softMatches);
    this.highlightedWordSet = wordSet;
  }

  clearHighlightedWords(): void{
    this.highlightedExactMatches = new Set<string>();
    this.highlightedSoftMatches = new Set<string>();
    this.highlightedWordSet = new Map<string, Set<string>>();
  }

  handleWordHovered(word: string): void{
    this.hoveredWord = word;
  }
}
