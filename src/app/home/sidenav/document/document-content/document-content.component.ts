import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {EscapeHtmlPipe} from '../../../../pipes/escape-html.pipe';
import escapeStringRegexp from 'escape-string-regexp';
import {WordSet} from '../../../comparison/comparison.component';

@Component({
  selector: 'app-document-content',
  templateUrl: './document-content.component.html',
  styleUrls: ['./document-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentContentComponent implements OnInit, OnChanges {

  @Input() content: string;
  @Input() highlightedExactMatches: Set<string>;
  @Input() highlightedSoftMatches: Set<string>;
  @Input() highlightedWordSet: WordSet;
  @Input() hoveredWord: string;

  convertedContent: string;

  constructor(
    public escapeHtml: EscapeHtmlPipe
  ) { }

  ngOnInit(): void {
    this.convertedContent = this.getFormattedContent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.highlightedWords && changes?.highlightedWords?.previousValue !== changes?.highlightedWords?.currentValue){
      this.convertedContent = this.getFormattedContent();
    }
  }

  getReversedWordSet(): Map<string, Set<string>>{
    const entries = this.highlightedWordSet.entries();
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

  isWordLowlighted(word: string, hoveredWord: string, words: Set<string>, reversedWordMap: WordSet): boolean{
    if (!hoveredWord){
      return false;
    }
    if (hoveredWord.includes('\0')){
      const split = hoveredWord.split('\0');
      return (words.has(split[0]) || words.has(split[1])) && !(word === split[0] || word === split[1]);
    }
    return words.has(hoveredWord) && !(hoveredWord === word || reversedWordMap.get(word)?.has(hoveredWord));
  }

  getFormattedContent(): string{
    const allWords = new Set([...this.highlightedSoftMatches, ...this.highlightedExactMatches]);
    let content = this.escapeHtml.transform(this.content);
    const reversedWordSet = this.getReversedWordSet();
    for (const word of allWords){
      const escapedWord = this.escapeHtml.transform(word);
      const re = new RegExp(`(?<=^|\\s)${escapeStringRegexp(escapedWord)}(?=$|\\s)`, 'g');
      const wordType = this.highlightedExactMatches.has(word) ? (this.highlightedSoftMatches.has(word) ? 'both' : 'exact') : 'soft';
      const isHovered = this.isWordLowlighted(word, this.hoveredWord, allWords, reversedWordSet);
      content = content.replace(re, `<span class="${isHovered ? 'lowlight' : 'highlight'} ${wordType}">${escapedWord}</span>`);
    }
    return content;
  }

}
