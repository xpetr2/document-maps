import {Component, HostListener, Input, OnChanges, OnInit, Query, SimpleChanges, ViewChild, EventEmitter, Output} from '@angular/core';
import {QueryService, SearchQuery} from '../../services/query.service';
import {SelectedDocument} from '../sidenav/sidenav.component';

export interface ExactMatch {
  word: string;
}

export interface SoftMatch {
  parent: string;
  softWord: string;
  strength: number;
}

export type WordSet = Map<string, ExactMatch | SoftMatch>;

@Component({
  selector: 'app-comparison',
  templateUrl: './comparison.component.html',
  styleUrls: ['./comparison.component.scss']
})
export class ComparisonComponent implements OnInit, OnChanges {

  @Input() searchQuery: SearchQuery;
  @Input() selectedDocuments: SelectedDocument[];
  @Output() wordsChanged = new EventEmitter<WordSet>();
  @Output() wordHovered = new EventEmitter<string>();

  wordPairs: {};
  sortedWordPairsExact: any[];
  sortedWordPairsSoft: any[];
  selectedWords: WordSet = new Map<string, ExactMatch | SoftMatch>();
  matchesScrollable = false;
  hoveredWord: string;

  @ViewChild('matches') matches: HTMLElement;

  constructor(private queryService: QueryService) {}

  ngOnInit(): void {
    if (this.selectedDocuments?.length === 2){
      this.generateWordPairs();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedDocuments){
      if (changes.selectedDocuments.currentValue.length === 2) {
        this.generateWordPairs();
      }
      this.clearWordSelection();
    }
  }

  generateWordPairs(): void{
    this.wordPairs =
      this.queryService.getNormalizedWordImportancePairs(this.selectedDocuments[0].id, this.selectedDocuments[1].id, this.searchQuery);
    this.generateExactPairs();
    this.generateSoftPairs();
  }

  generateExactPairs(): void{
    const exactPairs = this.queryService.getMostImportantExactMatches(this.wordPairs);
    const items = Object.keys(exactPairs).map((key) => {
      return [key, exactPairs[key]];
    });
    items.sort((first, second) => second[1] - first[1]);
    this.sortedWordPairsExact = items;
  }

  generateSoftPairs(): void{
    const softPairs = this.queryService.getMostImportantSoftMatches(this.wordPairs);
    const items = Object.keys(softPairs).map((key) => {
      return [key, softPairs[key]];
    });
    items.sort((first, second) => second[1] - first[1]);
    this.sortedWordPairsSoft = items;
  }

  checkOverflow(element: HTMLElement): void {
    this.matchesScrollable = element.offsetHeight < element.scrollHeight;
  }

  handleWordSelection(event: { word: string, checked: boolean }): void {
    if (event.checked){
      this.selectedWords.set(event.word, {word: event.word});
    } else {
      this.selectedWords.delete(event.word);
    }
    this.wordsChanged.emit(this.selectedWords);
  }

  clearWordSelection(): void{
    this.selectedWords.clear();
    this.wordsChanged.emit(this.selectedWords);
  }

  handleEntryHover(word: string, enter: boolean): void{
    const prevWord = this.hoveredWord;
    if (enter){
      this.hoveredWord = word;
    } else if (this.hoveredWord === word){
      this.hoveredWord = undefined;
    }
    if (prevWord !== this.hoveredWord){
      this.wordHovered.emit(this.hoveredWord);
    }
  }
}
