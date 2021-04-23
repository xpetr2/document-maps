import {Component, Input, OnChanges, OnInit, Query, SimpleChanges} from '@angular/core';
import {QueryService, SearchQuery} from '../../services/query.service';
import {SelectedDocument} from '../sidenav/sidenav.component';

@Component({
  selector: 'app-comparison',
  templateUrl: './comparison.component.html',
  styleUrls: ['./comparison.component.scss']
})
export class ComparisonComponent implements OnInit, OnChanges {

  @Input() searchQuery: SearchQuery;
  @Input() selectedDocuments: SelectedDocument[];

  wordPairs: {};
  sortedWordPairsExact: any[];
  sortedWordPairsSoft: any[];

  constructor(private queryService: QueryService) {
    this.queryService = queryService;
  }

  ngOnInit(): void {
    if (this.selectedDocuments?.length === 2){
      this.generateWordPairs();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedDocuments && this.selectedDocuments?.length === 2){
      this.generateWordPairs();
    }
  }

  generateWordPairs(): void{
    this.wordPairs =
      this.queryService.getNormalizedWordImportancePairs(this.selectedDocuments[0].id, this.selectedDocuments[1].id, this.searchQuery);
    this.generateExactPairs();
    this.generateSoftPairs();
  }

  generateExactPairs(): void{
    const exactPairs = this.queryService.getMostImportantExactMatches(this.wordPairs);
    const items = Object.keys(exactPairs).map((key) => {
      return [key, exactPairs[key]];
    });
    items.sort((first, second) => second[1] - first[1]);
    this.sortedWordPairsExact = items;
    console.log(this.sortedWordPairsExact);
  }

  generateSoftPairs(): void{
    const softPairs = this.queryService.getMostImportantSoftMatches(this.wordPairs);
    const items = Object.keys(softPairs).map((key) => {
      return [key, softPairs[key]];
    });
    items.sort((first, second) => second[1] - first[1]);
    this.sortedWordPairsSoft = items;
    console.log(this.sortedWordPairsSoft);
  }

}
