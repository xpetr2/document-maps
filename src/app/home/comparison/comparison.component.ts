import {Component, Input, OnChanges, OnInit, SimpleChanges, EventEmitter, Output} from '@angular/core';
import {QueryService} from '../../services/query.service';
import {SelectedDocument} from '../sidenav/sidenav.component';
import * as queryUtils from '../../utils/query.utils';

/**
 * An enum, specifying the hover event type
 */
export enum EntryHoverEvent{
  Enter, Leave
}

/**
 * A type, specifying the relation of two matched words
 */
export type WordMap = Map<string, Set<string>>;

/**
 * A component responsible for the user interface for the selection of words which are to be highlighted
 */
@Component({
  selector: 'app-comparison',
  templateUrl: './comparison.component.html',
  styleUrls: ['./comparison.component.scss']
})
export class ComparisonComponent implements OnInit, OnChanges {

  /**
   * The currently selected documents
   */
  @Input() selectedDocuments: SelectedDocument[];

  /**
   * An event emitter that emits when the word selection has been changed
   */
  @Output() wordsChanged = new EventEmitter<WordMap>();
  /**
   * An event emitter that emits when the user hovers over a word
   */
  @Output() wordHovered = new EventEmitter<string>();

  /**
   * Holds the all matched word pairs and their associated weight
   */
  wordPairs: {[key: string]: number};
  /**
   * Holds the sorted exact matches
   */
  sortedWordPairsExact: any[];
  /**
   * Holds the sorted soft matches
   */
  sortedWordPairsSoft: any[];
  /**
   * Holds the selected words in a hierarchical structure
   */
  selectedWords: WordMap = new Map<string, Set<string>>();
  /**
   * Holds the information of if an HTML element is scrollable
   */
  scrollable: {[key: string]: boolean} = {};
  /**
   * The currently hovered on word
   */
  hoveredWord: string;
  /**
   * The similarity between the two selected documents
   */
  documentSimilarities: number;

  /**
   * A helper field, making it possible to use enum in the HTML template
   */
  entryHoverEvent = EntryHoverEvent;

  /**
   * @param queryService  The QueryService holding the corpus
   */
  constructor(private queryService: QueryService) {}

  ngOnInit(): void {
    if (this.selectedDocuments?.length === 2){
      this.generateWordPairs();
      const id1 = this.selectedDocuments[0].id;
      const id2 = this.selectedDocuments[1].id;
      this.documentSimilarities = this.queryService.getSoftCosineMeasure(id1, id2);
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

  /**
   * Generates the word pairs from the corpus in QueryService
   */
  generateWordPairs(): void{
    this.wordPairs = this.queryService.getNormalizedWordImportancePairs(this.selectedDocuments[0].id, this.selectedDocuments[1].id);

    this.generateExactPairs();
    this.generateSoftPairs();
  }

  /**
   * Populates the sortedWordPairsExact variable with just exact matches
   */
  generateExactPairs(): void{
    const exactPairs = queryUtils.getMostImportantExactMatches(this.wordPairs);
    const items = Object.keys(exactPairs).map((key) => {
      return [key, exactPairs[key]];
    });
    items.sort((first, second) => second[1] - first[1]);
    this.sortedWordPairsExact = items;
  }

  /**
   * Populates the sortedWordPairsSoft variable with just soft matches
   */
  generateSoftPairs(): void{
    const softPairs = queryUtils.getMostImportantSoftMatches(this.wordPairs);
    const items = Object.keys(softPairs).map((key) => {
      return [key, softPairs[key]];
    });
    items.sort((first, second) => second[1] - first[1]);
    this.sortedWordPairsSoft = items;
  }

  /**
   * Checks whether a given HTML element is overflowing
   * @param element   The HTML element
   */
  checkOverflow(element: HTMLElement): void {
    this.scrollable[element.id] = element.offsetHeight < element.scrollHeight
      && !(element.scrollHeight - element.scrollTop - element.clientHeight < 1);
  }

  /**
   * The event handler of when the word selection changes
   * @param e The event holding which word was updated, whether it was checked or not and potentially its soft match
   */
  handleWordSelection(e: { word: string, checked: boolean, softMatch: string }): void {
    const entry = this.selectedWords.get(e.word);
    const matchWord = e.softMatch ?? e.word;
    if (e.checked){
      if (this.selectedWords.has(e.word)){
        entry?.add(matchWord);
      } else {
        this.selectedWords.set(e.word, new Set<string>([matchWord]));
      }
    } else {
      if (entry?.size > 1){
        entry.delete(matchWord);
      } else {
        this.selectedWords.delete(e.word);
      }
    }
    this.wordsChanged.emit(this.selectedWords);
  }

  /**
   * Clears the selected words
   */
  clearWordSelection(): void{
    this.selectedWords.clear();
    this.wordsChanged.emit(this.selectedWords);
  }

  /**
   * Handles when the user hovers over a word
   * @param word  The word that was hovered on
   * @param event The event type, whether it was an entry or leave event
   */
  handleEntryHover(word: string, event: EntryHoverEvent): void{
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
