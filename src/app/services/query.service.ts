import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {LoadingService} from './loading.service';
import * as queryUtils from '../utils/query.utils';
import {GraphData, SearchQuery} from '../utils/query.utils';
import {filter, map, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QueryService {
  private querySource = new BehaviorSubject<SearchQuery>(undefined);
  currentQuery = this.querySource.asObservable();

  readonly worker: Worker;

  private workerData = new Subject<any>();

  constructor(private loadingService: LoadingService) {
    if (typeof Worker !== 'undefined'){
      this.worker = new Worker('../workers/graph-data.worker', { type: 'module' });
      this.worker.onmessage = ({ data }) => {
        this.workerData.next(data);
      };
    }
  }

  setQuery(query: SearchQuery): void{
    this.querySource.next(query);
  }

  private usedQuery(query: SearchQuery): SearchQuery{
    if (!query && !this.querySource.getValue()){
      return undefined;
    }
    return query ? query : this.querySource.getValue();
  }

  getWordId(word: string, query?: SearchQuery): string {
    return queryUtils.getWordId(word, this.usedQuery(query));
  }

  getWord(wordID: string, query?: SearchQuery): string {
   return queryUtils.getWord(wordID, this.usedQuery(query));
  }

  getSimilarity(w1: string, w2: string, query?: SearchQuery): number {
    return queryUtils.getSimilarity(w1, w2, this.usedQuery(query));
  }

  getSimilarityWord(word1: string, word2: string, query?: SearchQuery): number{
    return queryUtils.getSimilarityWord(word1, word2, this.usedQuery(query));
  }

  innerProduct(t1, t2, query?: SearchQuery): number{
    return queryUtils.innerProduct(t1, t2, this.usedQuery(query));
  }

  innerProductSingle(t, query?: SearchQuery): number {
    return queryUtils.innerProductSingle(t, this.usedQuery(query));
  }

  softCosineMeasureNorm(t1, t2, query?: SearchQuery): number{
    return queryUtils.softCosineMeasureNorm(t1, t2, this.usedQuery(query));
  }

  getSoftCosineMeasure(textID1: string, textID2: string, query?: SearchQuery): number {
    return queryUtils.getSoftCosineMeasure(textID1, textID2, this.usedQuery(query));
  }

  getDocumentText(textID: string, query?: SearchQuery): string{
    return queryUtils.getDocumentText(textID, this.usedQuery(query));
  }

  getNormalizedWordImportancePairs(text1: string, text2: string, query?: SearchQuery): {[key: string]: number}{
    return queryUtils.getNormalizedWordImportancePairs(text1, text2, this.usedQuery(query));
  }

  initGraphData(query?: SearchQuery): Observable<GraphData>{
    this.loadingService.setIsLoading(true);
    const observable = this.workerData.asObservable()
      .pipe(
        tap(progress => {
          this.loadingService.setLoadingStage(progress.stage);
          this.loadingService.setLoadingProgress(progress.value);
        }),
        filter(data => data.data),
        map(data => {
          this.loadingService.setIsLoading(false);
          return data.data;
        })
      );
    this.worker.postMessage({query: this.usedQuery(query)});
    return observable;
  }
}
