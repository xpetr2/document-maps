import {Component, Input, Output, EventEmitter} from '@angular/core';
import {MatCheckboxChange} from '@angular/material/checkbox';

/**
 * The individual word entry, containing the UI and logic for one word
 */
@Component({
  selector: 'app-comparison-entry',
  templateUrl: './comparison-entry.component.html',
  styleUrls: ['./comparison-entry.component.scss']
})
export class ComparisonEntryComponent {

  /**
   * The word this entry is bound to
   */
  @Input() word: string;
  /**
   * The weight of the current word match in the document comparison
   */
  @Input() weight: number;
  /**
   * The total cosine similarity of the two compared documents
   */
  @Input() documentSimilarity: number;
  /**
   * The soft match this word has
   */
  @Input() softMatch: string;

  /**
   * The event emitter, emitting when the user has selected this word
   */
  @Output() selectedChange = new EventEmitter<{ word: string; checked: boolean; softMatch: string }>();

  /**
   * Calculates the bar width percentage
   */
  getBarWidth(): number{
    return this.weight / this.documentSimilarity;
  }

  /**
   * An event handler, handling when the checkmark is checked
   * @param e The checkbox event
   */
  handleChange(e: MatCheckboxChange): void{
    this.selectedChange.emit({ word: this.word, checked: e.checked, softMatch: this.softMatch});
  }
}
