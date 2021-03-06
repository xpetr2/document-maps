import {Component, EventEmitter, Input, Output} from '@angular/core';
import {WordMap} from './comparison/comparison.component';

/**
 * The interface of a displayed document
 */
export interface SelectedDocument{
  id: string;
  title: string;
  subtitle: string;
  content: string;
}

/**
 * The component, contained within the Angular Material sidenav, displaying the documents and comparison components
 */
@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
  /**
   * The currently selected documents
   */
  @Input() selectedDocuments: SelectedDocument[] = [];
  /**
   * A value, specifying whether the comparing window should be open
   */
  @Input() comparingWindowOpen = false;

  /**
   * An event, that emits when the sidebar closes
   */
  @Output() sidebarClose = new EventEmitter<any>();
  /**
   * An event, that emits when the user clicks on the comparison button
   */
  @Output() compareClick = new EventEmitter<any>();

  /**
   * A set containing the currently highlighted exact matches
   */
  highlightedExactMatches = new Set<string>();
  /**
   * A set containing the currently highlighted soft matches
   */
  highlightedSoftMatches: [Set<string>, Set<string>] = [new Set<string>(), new Set<string>()];
  /**
   * A map, that contains the relationships of matches
   */
  highlightedWordMap: WordMap = new Map<string, Set<string>>();
  /**
   * The currently hovered on word within the comparison screen
   */
  hoveredWord: string;

  /**
   * An event handler, that handles when the sidenav is closed
   * @param e The mouse event that closed the sidenav
   */
  closeSidenav(e: MouseEvent): void {
    // Notify the parent
    this.sidebarClose.emit(e);
    this.clearHighlightedWords();
  }

  /**
   * An event handler, that handles when user clicks on the comparison button
   * @param e The mouse event of clicking on the comparison button
   */
  clickedCompare(e: MouseEvent): void {
    // Notify the parent
    this.compareClick.emit(e);
    this.clearHighlightedWords();
  }

  /**
   * An event handler, that updates the highlighted matches when the user has changed what words should be highlighted
   * @param wordMap The WordMap containing the relationships of matches
   */
  handleWordsChanged(wordMap: WordMap): void{
    // Create arrays from the keys and concatenated values
    const keyArray = Array.from(wordMap.keys());
    const concatenatedSoft = Array.from(wordMap.values())
      .reduce((a, c) => a.concat([...c]), []);

    // Store the keys of the word map, containing the exact matches
    this.highlightedExactMatches = new Set<string>(keyArray
      .filter(word => concatenatedSoft.includes(word))
    );

    // Filter out the soft matches, that will be displayed in the left document
    const leftSoftMatches = new Set<string>(keyArray
      .filter(word => !concatenatedSoft.includes(word))
    );

    // filter out the soft matches, that will be displayed in the right document
    const rightSoftMatches = new Set<string>(concatenatedSoft
      .filter(word => !keyArray.includes(word))
    );

    this.highlightedSoftMatches = [leftSoftMatches, rightSoftMatches];
    this.highlightedWordMap = wordMap;
  }

  /**
   * Clears the highlighted words
   */
  clearHighlightedWords(): void{
    this.highlightedExactMatches = new Set<string>();
    this.highlightedSoftMatches = [new Set<string>(), new Set<string>()];
    this.highlightedWordMap = new Map<string, Set<string>>();
  }

  /**
   * An event handler, handling the change of the hovered on word
   * @param word  The new hovered word
   */
  handleWordHovered(word: string): void{
    this.hoveredWord = word;
  }
}
