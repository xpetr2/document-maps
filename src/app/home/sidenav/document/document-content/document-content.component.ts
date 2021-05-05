import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {EscapeHtmlPipe} from '../../../../pipes/escapeHtml.pipe';
import escapeStringRegexp from 'escape-string-regexp';

@Component({
  selector: 'app-document-content',
  templateUrl: './document-content.component.html',
  styleUrls: ['./document-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentContentComponent implements OnInit, OnChanges {

  @Input() content: string;
  @Input() highlightedWords: string[];
  @Input() hoveredWord: string;

  convertedContent: string;

  constructor(public escapeHtml: EscapeHtmlPipe) { }

  ngOnInit(): void {
    this.convertedContent = this.getFormattedContent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.highlightedWords && changes?.highlightedWords?.previousValue !== changes?.highlightedWords?.currentValue){
      this.convertedContent = this.getFormattedContent();
    }
  }

  getFormattedContent(): string{
    let escapedContent = this.escapeHtml.transform(this.content);
    if (this.highlightedWords) {
      for (const word of this.highlightedWords) {
        const escapedWord = this.escapeHtml.transform(word);
        const re = new RegExp(`\\b${escapeStringRegexp(escapedWord)}\\b`, 'g');
        const wordClass = this.hoveredWord && this.highlightedWords.includes(this.hoveredWord) && word !== this.hoveredWord ? 'lowlight' : 'highlight';
        escapedContent = escapedContent.replace(re, `<span class="${wordClass}">${escapedWord}</span>`);
      }
    }
    return escapedContent;
  }

}
