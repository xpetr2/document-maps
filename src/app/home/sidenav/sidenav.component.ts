import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {WordMap} from '../comparison/comparison.component';

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
  @Output() sidebarClose = new EventEmitter<any>();
  @Output() compareClick = new EventEmitter<any>();

  highlightedExactMatches = new Set<string>();
  highlightedSoftMatches = new Set<string>();
  highlightedWordMap: WordMap = new Map<string, Set<string>>();
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

  handleWordsChanged(wordMap: WordMap): void{
    this.highlightedExactMatches = new Set<string>(wordMap.keys());
    const softMatches = Array.from(wordMap.values())
      .reduce((a, c) => a.concat([...c]), [])
      .filter(a => !this.highlightedExactMatches.has(a));
    this.highlightedSoftMatches = new Set(softMatches);
    this.highlightedWordMap = wordMap;
  }

  clearHighlightedWords(): void{
    this.highlightedExactMatches = new Set<string>();
    this.highlightedSoftMatches = new Set<string>();
    this.highlightedWordMap = new Map<string, Set<string>>();
  }

  handleWordHovered(word: string): void{
    this.hoveredWord = word;
  }
}
