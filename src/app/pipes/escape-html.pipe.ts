import {Pipe, PipeTransform} from '@angular/core';

/**
 * A pipe that replaces the HTML special characters
 */
@Pipe({
  name: 'escapeHtml'
})
export class EscapeHtmlPipe implements PipeTransform {
  /**
   * The transform function of the pipe
   * @param text  The text to be transformed
   */
  transform(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
