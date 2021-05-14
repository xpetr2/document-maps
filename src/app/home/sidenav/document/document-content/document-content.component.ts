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
  @Input() highlightedSoftMatches: Set<string>;
  /**
   * The current WordMap containing the relations of matched words
   */
  @Input() highlightedWordMap: WordMap;
  /**
   * The currently hovered on word
   */
  @Input() hoveredWord: string;

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
    for (const [parent, set] of entries){
      for (const match of set){
        if (out.has(match)){
          out.get(match).add(parent);
        } else {
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
  isWordLowlighted(word: string, hoveredWord: string, words: Set<string>, reversedWordMap: WordMap): boolean{
    if (!hoveredWord){
      return false;
    }
    if (hoveredWord.includes(pairSeparator)){
      const [w1, w2] = this.splitUpPipe.transform(hoveredWord);
      return (words.has(w1) || words.has(w2)) && !(word === w1 || word === w2);
    }
    return words.has(hoveredWord) && !(hoveredWord === word || reversedWordMap.get(word)?.has(hoveredWord));
  }

  /**
   * Sets the content of this document, highlighting and lowlighting the appropriate words in the process
   */
  getFormattedContent(): string{
    const allWords = new Set([...this.highlightedSoftMatches, ...this.highlightedExactMatches]);
    let content = this.escapeHtml.transform(this.content);
    const reversedWordMap = this.getReversedWordMap();
    for (const word of allWords){
      const escapedWord = this.escapeHtml.transform(word);
      const re = new RegExp(`(?<=^|\\s)${escapeStringRegexp(escapedWord)}(?=$|\\s)`, 'g');
      const wordType = this.highlightedExactMatches.has(word) ? (this.highlightedSoftMatches.has(word) ? 'both' : 'exact') : 'soft';
      const isHovered = this.isWordLowlighted(word, this.hoveredWord, allWords, reversedWordMap);
      content = content.replace(re, `<span class="${isHovered ? 'lowlight' : 'highlight'} ${wordType}">${escapedWord}</span>`);
    }
    return content;
  }

}
