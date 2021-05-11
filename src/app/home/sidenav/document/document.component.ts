import {Component, Input} from '@angular/core';
import {SelectedDocument} from '../sidenav.component';
import {WordMap} from '../../comparison/comparison.component';

/**
 * The displayed document component, showing the documents text
 */
@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss']
})
export class DocumentComponent {

  /**
   * The bound displayed document to this component
   */
  @Input() document: SelectedDocument;
  /**
   * The currently highlighted exact matches
   */
  @Input() highlightedExactMatches: Set<string>;
  /**
   * The currently highlighted soft matches
   */
  @Input() highlightedSoftMatches: Set<string>;
  /**
   * The current WordMap containing the relations of matches
   */
  @Input() highlightedWordMap: WordMap;
  /**
   * The currently hovered on word
   */
  @Input() hoveredWord: string;

}
