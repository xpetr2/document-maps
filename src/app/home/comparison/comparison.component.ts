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

export enum EntryType {
  Exact, Soft
}

export enum EntryHoverEvent{
  Enter, Leave
}

export type WordMap = Map<string, Set<string>>;

@Component({
  selector: 'app-comparison',
  templateUrl: './comparison.component.html',
  styleUrls: ['./comparison.component.scss']
})
export class ComparisonComponent implements OnInit, OnChanges {

  @Input() searchQuery: SearchQuery;
  @Input() selectedDocuments: SelectedDocument[];
  @Output() wordsChanged = new EventEmitter<WordMap>();
  @Output() wordHovered = new EventEmitter<string>();

  wordPairs: {};
  sortedWordPairsExact: any[];
  sortedWordPairsSoft: any[];
  selectedWords: WordMap = new Map<string, Set<string>>();
  scrollable: {[key: string]: boolean} = {};
  hoveredWord: string;

  entryType = EntryType;
  entryHoverEvent = EntryHoverEvent;

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
    this.scrollable[element.id] = element.offsetHeight < element.scrollHeight
      && !(element.scrollHeight - element.scrollTop - element.clientHeight < 1);
  }

  handleWordSelection(event: { word: string, checked: boolean, softMatch: string }): void {
    const entry = this.selectedWords.get(event.word);
    const matchWord = event.softMatch ?? event.word;
    if (event.checked){
      if (this.selectedWords.has(event.word)){
        entry?.add(matchWord);
      } else {
        this.selectedWords.set(event.word, new Set<string>([matchWord]));
      }
    } else {
      if (entry?.size > 1){
        entry.delete(matchWord);
      } else {
        this.selectedWords.delete(event.word);
      }
    }
    this.wordsChanged.emit(this.selectedWords);
  }

  clearWordSelection(): void{
    this.selectedWords.clear();
    this.wordsChanged.emit(this.selectedWords);
  }

  handleEntryHover(word: string, event: EntryHoverEvent, entryType: EntryType): void{
    const prevWord = this.hoveredWord;
    if (event === EntryHoverEvent.Enter){
      this.hoveredWord = word;
    } else if (this.hoveredWord === word){
      this.hoveredWord = undefined;
    }
    if (prevWord !== this.hoveredWord){
      this.wordHovered.emit(this.hoveredWord);
    }
  }
}
