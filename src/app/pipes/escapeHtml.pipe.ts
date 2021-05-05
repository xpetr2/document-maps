import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'escapeHtml'})
export class EscapeHtmlPipe implements PipeTransform {
  constructor(){}

  transform(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
