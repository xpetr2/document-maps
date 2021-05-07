import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {EscapeHtmlPipe} from '../../../../pipes/escape-html.pipe';
import escapeStringRegexp from 'escape-string-regexp';
import {QueryService, SearchQuery} from '../../../../services/query.service';
import {WordSet} from '../../../comparison/comparison.component';

@Component({
  selector: 'app-document-content',
  templateUrl: './document-content.component.html',
  styleUrls: ['./document-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentContentComponent implements OnInit, OnChanges {

  @Input() content: string;
  @Input() highlightedExactMatches: string[];
  @Input() highlightedSoftMatches: string[];
  @Input() highlightedWordSet: WordSet;
  @Input() highlightedWordSimilarities: Map<string, number>;
  @Input() hoveredWord: string;

  convertedContent: string;

  constructor(
    public escapeHtml: EscapeHtmlPipe,
    private queryService: QueryService
  ) { }

  ngOnInit(): void {
    this.convertedContent = this.getFormattedContent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.highlightedWords && changes?.highlightedWords?.previousValue !== changes?.highlightedWords?.currentValue){
      this.convertedContent = this.getFormattedContent();
    }
  }

  formatWords(content: string, wordList: string[], className: string): string{
    if (wordList) {
      for (const word of wordList) {
        const escapedWord = this.escapeHtml.transform(word);
        const re = new RegExp(`(?<=^|\\s)${escapeStringRegexp(escapedWord)}(?=$|\\s)`, 'g');
        const wordClass = this.hoveredWord && this.highlightedExactMatches.includes(this.hoveredWord) && word !== this.hoveredWord ? 'lowlight' : 'highlight';
        let weight = 1;
        if (!this.highlightedWordSet.has(word)){
          console.log(this.highlightedWordSimilarities);
          for (const [key, set] of this.highlightedWordSet.entries()){
            if (set.has(word)){
              weight = this.highlightedWordSimilarities?.get(`${key}\0${word}`) ?? 1;
            }
          }
        }
        content = content.replace(re, `<span class="${wordClass} ${className} weight-${Math.floor(weight * 10)}">${escapedWord}</span>`);
      }
    }
    return content;
  }

  getFormattedContent(): string{
    const escapedContent = this.escapeHtml.transform(this.content);
    const exactMatched = this.formatWords(escapedContent, this.highlightedExactMatches, 'exact-match');
    return this.formatWords(exactMatched, this.highlightedSoftMatches, 'soft-match');
  }

}
