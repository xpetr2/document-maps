import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {QueryService, SearchQuery} from '../../services/query.service';
import {WordSet} from '../comparison/comparison.component';

export interface SelectedDocument{
  id: string;
  title: string;
  subtitle: string;
  content: string;
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  @Input() selectedDocuments: SelectedDocument[] = [];
  @Input() comparingWindowOpen = false;
  @Input() searchQuery: SearchQuery;
  @Output() sidebarClose = new EventEmitter<any>();
  @Output() compareClick = new EventEmitter<any>();

  compareWindow = false;
  highlightedExactMatches: string[] = [];
  highlightedSoftMatches: string[] = [];
  highlightedWordSet: WordSet = new Map<string, Set<string>>();
  highlightedWordWeights = new Map<string, number>();
  hoveredWord: string;

  constructor(private queryService: QueryService) { }

  ngOnInit(): void {
  }

  closeSidenav($event: MouseEvent): void {
    this.sidebarClose.emit($event);
    this.clearHighlightedWords();
  }

  clickedCompare($event: MouseEvent): void {
    this.compareClick.emit($event);
    this.clearHighlightedWords();
  }

  generateWordSimilarities(wordSet: WordSet): void{
    const wordSetEntries = wordSet.entries();
    for (const [key, set] of wordSetEntries){
      for (const value of set) {
        const match = `${key}\0${value}`;
        const weight = this.queryService.getSimilarityWord(key, value, this.searchQuery);
        this.highlightedWordWeights.set(match, weight);
      }
    }
  }

  handleWordsChanged(wordSet: WordSet): void{
    this.highlightedExactMatches = Array.from(wordSet.keys());
    const softMatches = Array.from(wordSet.values())
      .reduce((a, c) => a.concat([...c]), [])
      .filter(a => !this.highlightedExactMatches.includes(a));
    this.highlightedSoftMatches = Array.from(new Set(softMatches));
    this.highlightedWordSet = wordSet;
    this.generateWordSimilarities(wordSet);
  }

  clearHighlightedWords(): void{
    this.highlightedExactMatches = [];
    this.highlightedSoftMatches = [];
    this.highlightedWordSet = new Map<string, Set<string>>();
    this.highlightedWordWeights = new Map<string, number>();
  }

  handleWordHovered(word: string): void{
    this.hoveredWord = word;
  }
}
