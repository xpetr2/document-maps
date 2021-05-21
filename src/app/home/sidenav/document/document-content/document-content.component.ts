import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {EscapeHtmlPipe} from '../../../../pipes/escape-html.pipe';
import escapeStringRegexp from 'escape-string-regexp';
import {WordMap} from '../../comparison/comparison.component';
import {pairSeparator, valueChanged} from '../../../../utils/various.utils';
import {SplitUpPipe} from '../../../../pipes/pair-split.pipe';

/**
 * The content of a document, showing the actual text of the document and the highlights
 */
@Component({
  selector: 'app-document-content',
  templateUrl: './document-content.component.html',
  styleUrls: ['./document-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentContentComponent implements OnInit, OnChanges {

  /**
   * The text of the document
   */
  @Input() content: string;
  /**
   * The currently highlighted exact matches
   */
  @Input() highlightedExactMatches: Set<string>;
  /**
   * The currently highlighted soft matches
   */
  @Input() highlightedSoftMatches: [Set<string>, Set<string>];
  /**
   * The current WordMap containing the relations of matched words
   */
  @Input() highlightedWordMap: WordMap;
  /**
   * The currently hovered on word
   */
  @Input() hoveredWord: string;
  /**
   * The index in the array of selected documents
   */
  @Input() documentIndex: number;

  /**
   * The HTML safe content
   */
  convertedContent: string;

  /**
   * @param escapeHtml  The pipe, responsible for converting text to HTML safe text
   * @param splitUpPipe A pipe, splitting up the pairs
   */
  constructor(
    public escapeHtml: EscapeHtmlPipe,
    public splitUpPipe: SplitUpPipe
  ) { }

  ngOnInit(): void {
    this.convertedContent = this.getFormattedContent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If the highlighted word changes, format the content again
    if (valueChanged(changes?.highlightedWords)){
      this.convertedContent = this.getFormattedContent();
    }
  }

  /**
   * Gets the reversed WordMap, mapping child words to their parent words
   */
  getReversedWordMap(): WordMap{
    const entries = this.highlightedWordMap.entries();
    const out = new Map<string, Set<string>>();
    // Go over the parent and all children
    for (const [parent, set] of entries){
      for (const match of set){
        // If the reverse map already has the child as a key
        if (out.has(match)){
          // Add the parent to the set
          out.get(match).add(parent);
        } else {
          // Create an entry for the child and parent
          out.set(match, new Set<string>([parent]));
        }
      }
    }
    return out;
  }

  /**
   * Determines whether a word should be marked as lowlighted, making it less visible in the document
   * @param word              The word that's being evaluated
   * @param hoveredWord       The currently hovered on word
   * @param words             The set, containing all the matched words
   * @param reversedWordMap   The reversed WordMap
   */
  isWordLowlighted(word: string, hoveredWord: string, words: Set<string>, reversedWordMap: WordMap): boolean {
    // If there is no hovered word, then no words should be low-lighted
    if (!hoveredWord){
      return false;
    }
    // If the hovered word is a soft match (contains a pair separator)
    if (hoveredWord.includes(pairSeparator)){
      // Split the pair up
      const split = this.splitUpPipe.transform(hoveredWord);
      // See if one of the words in the pair is selected and neither of the words is the one being evaluated
      return (words.has(split[this.documentIndex])) && !(word === split[this.documentIndex]);
    }
    // If the hovered word is an exact match, see if the hovered word is selected and is not the one being evaluated
    return words.has(hoveredWord) && !(hoveredWord === word || reversedWordMap.get(word)?.has(hoveredWord));
  }

  /**
   * Sets the content of this document, highlighting and lowlighting the appropriate words in the process
   */
  getFormattedContent(): string{
    // Get the soft matches for this document
    const currentDocumentSofts = this.highlightedSoftMatches[this.documentIndex];
    // Merge the exact and soft matches sets
    const allWords = new Set([...currentDocumentSofts, ...this.highlightedExactMatches]);
    // Escape the potential intrusive HTML characters
    let content = this.escapeHtml.transform(this.content);
    const reversedWordMap = this.getReversedWordMap();
    // Go over all the selected words
    for (const word of allWords){
      // Escape the evaluated word for more unsafe HTML characters
      const escapedWord = this.escapeHtml.transform(word);
      // Create a new RegEx, that matches all the looked for words, that have no characters before and after
      const re = new RegExp(`(?<=^|\\s)${escapeStringRegexp(escapedWord)}(?=$|\\s)`, 'g');
      // See what type of a match the word is
      const wordType = this.getWordType(word, reversedWordMap);
      // See if the word should be highlighted or lowlighted
      const lowlighted = this.isWordLowlighted(word, this.hoveredWord, allWords, reversedWordMap);
      // Replace all the matched words with the span tag
      content = content.replace(re, `<span class="${lowlighted ? 'lowlight' : 'highlight'} ${wordType}">${escapedWord}</span>`);
    }
    return content;
  }

  /**
   * Determines, whether the given word is an exact match, soft match or both
   * @param word              The word we wish to find out the type of
   * @param reversedWordMap   The reversed word map
   */
  getWordType(word: string, reversedWordMap: WordMap): string{
    // See if the word is in the word map and if it contains itself as a child
    if (this.highlightedWordMap.has(word) && this.highlightedWordMap.get(word).has(word)){
      // If the word map has only itself as a child and no other word has it as its child, then its an exact match, otherwise its both
      const both = this.highlightedWordMap.get(word).size > 1 || reversedWordMap.get(word).size > 1;
      return both ? 'both' : 'exact';
    }
    // Otherwise it's a soft match
    return 'soft';
  }

}
