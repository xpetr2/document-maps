import {Component, Input, OnChanges, OnInit, SimpleChanges, EventEmitter, Output} from '@angular/core';
import {QueryService} from '../../../services/query.service';
import {SelectedDocument} from '../sidenav.component';
import * as queryUtils from '../../../utils/query.utils';

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
    // When the component becomes active and there are exactly two selected documents
    if (this.selectedDocuments?.length === 2){
      this.generateWordPairs();
      const id1 = this.selectedDocuments[0].id;
      const id2 = this.selectedDocuments[1].id;
      this.documentSimilarities = this.queryService.getSoftCosineMeasure(id1, id2);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // When the user selects or deselects some documents
    if (changes.selectedDocuments){
      // If the new selection has only two documents selected
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
    // Retrieve the word pairs from the corpus
    this.wordPairs = this.queryService.getNormalizedWordImportancePairs(this.selectedDocuments[0].id, this.selectedDocuments[1].id);

    // Extract the exact and soft pairs from them
    this.generateExactPairs();
    this.generateSoftPairs();
  }

  /**
   * Populates the sortedWordPairsExact variable with just exact matches
   */
  generateExactPairs(): void{
    // Extract the exact matches from all the word pairs
    const exactPairs = queryUtils.getMostImportantExactMatches(this.wordPairs);
    // Sort the array
    const items = Object.keys(exactPairs).map((key) => {
      return [key, exactPairs[key]];
    });
    items.sort((first, second) => second[1] - first[1]);
    // Store the array
    this.sortedWordPairsExact = items;
  }

  /**
   * Populates the sortedWordPairsSoft variable with just soft matches
   */
  generateSoftPairs(): void{
    // Extract the soft matches from all the word pairs
    const softPairs = queryUtils.getMostImportantSoftMatches(this.wordPairs);
    // Sort the array
    const items = Object.keys(softPairs).map((key) => {
      return [key, softPairs[key]];
    });
    items.sort((first, second) => second[1] - first[1]);
    // Store the array
    this.sortedWordPairsSoft = items;
  }

  /**
   * Checks whether a given HTML element is overflowing
   * @param element   The HTML element
   */
  checkOverflow(element: HTMLElement): void {
    // Look, if the element is taller than the actual showed height and isn't scrolled all the way down
    this.scrollable[element.id] = element.offsetHeight < element.scrollHeight
      && !(element.scrollHeight - element.scrollTop - element.clientHeight < 1);
  }

  /**
   * The event handler of when the word selection changes
   * @param e The event holding which word was updated, whether it was checked or not and potentially its soft match
   */
  handleWordSelection(e: { word: string, checked: boolean, softMatch: string }): void {
    // Get the exact and soft matches of the parent word
    const entry = this.selectedWords.get(e.word);
    // Get the word we're looking the match
    const matchWord = e.softMatch ?? e.word;
    // See if the word was selected
    if (e.checked){
      // If the parent word is already selected, we just add the matched word
      if (this.selectedWords.has(e.word)){
        entry?.add(matchWord);
      }
      // Otherwise we create a new entry
      else {
        this.selectedWords.set(e.word, new Set<string>([matchWord]));
      }
    }
    // If the word was deselected
    else {
      // If there are more matched words to the parent word, we only remove the one matched word
      if (entry?.size > 1){
        entry.delete(matchWord);
      }
      // Otherwise we delete the entire parent from the map
      else {
        this.selectedWords.delete(e.word);
      }
    }
    // Notify the parent
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
    // Temporarily store the previously hovered word
    const prevWord = this.hoveredWord;
    // If the user started hovering a word, we store it
    if (event === EntryHoverEvent.Enter){
      this.hoveredWord = word;
    }
    // Otherwise, the user has left the word, if the word is the currently hovered word, we reset it.
    else if (this.hoveredWord === word){
      this.hoveredWord = undefined;
    }
    // If the hovered word has changed, we notify the parent
    if (prevWord !== this.hoveredWord){
      this.wordHovered.emit(this.hoveredWord);
    }
  }
}
