import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {LoadingService} from './loading.service';
import * as queryUtils from '../utils/query.utils';
import {GraphData, Corpus} from '../utils/query.utils';
import {filter, map, tap} from 'rxjs/operators';

/**
 * The query service, responsible for querying on and operating with the corpus while also the corpus itself
 */
@Injectable({
  providedIn: 'root'
})
export class QueryService {
  /**
   * The subject storing the corpus itself
   * @private
   */
  private corpusSource = new BehaviorSubject<Corpus>(undefined);
  /**
   * The observable generated from corpusSource
   */
  currentCorpus = this.corpusSource.asObservable();

  /**
   * The worker, eventually responsible for generating the initial GraphData
   */
  readonly worker: Worker;

  /**
   * The stored data from passed from the worker
   * @private
   */
  private workerData = new Subject<any>();

  /**
   * A constructor, initializing the worker
   * @param loadingService  The loading service, handling the progress reports
   */
  constructor(private loadingService: LoadingService) {
    // Create the web worker
    if (typeof Worker !== 'undefined'){
      this.worker = new Worker('../workers/graph-data.worker', { type: 'module' });
      // If the web worker receives any data, store it in this service
      this.worker.onmessage = ({ data }) => {
        this.workerData.next(data);
      };
    }
  }

  /**
   * A setter for the corpus value
   * @param corpus  The corpus to be set
   */
  setCorpus(corpus: Corpus): void{
    this.corpusSource.next(corpus);
  }

  /**
   * A helper function, checking if the passed in corpus exists, otherwise defaulting to the global one
   * @param corpus  The corpus to be checked
   * @private
   */
  private usedCorpus(corpus: Corpus): Corpus{
    // If there is no passed in corpus or a default one set return undefined
    if (!corpus && !this.corpusSource.getValue()){
      return undefined;
    }
    // Otherwise if there is a passed in corpus, use that one, otherwise use the default one
    return corpus ? corpus : this.corpusSource.getValue();
  }

  /**
   * Returns the ID of a given word
   * @param word    The word to retrieve the id of
   * @param corpus  Optional corpus, defaults to the global one
   */
  getWordId(word: string, corpus?: Corpus): string {
    return queryUtils.getWordId(word, this.usedCorpus(corpus));
  }

  /**
   * Returns the word from dictionary of a given id
   * @param id      The id to retrieve the word of
   * @param corpus  Optional corpus, defaults to the global one
   */
  getWord(id: string, corpus?: Corpus): string {
   return queryUtils.getWord(id, this.usedCorpus(corpus));
  }

  /**
   * Returns the cosine similarity of two word ids
   * @param id1     The first id to compare
   * @param id2     The second id to compare
   * @param corpus  Optional corpus, defaults to the global one
   */
  getSimilarity(id1: string, id2: string, corpus?: Corpus): number {
    return queryUtils.getSimilarity(id1, id2, this.usedCorpus(corpus));
  }

  /**
   * Returns the cosine similarity of two words
   * @param word1   The first word to compare
   * @param word2   The second word to compare
   * @param corpus  Optional corpus, defaults to the global one
   */
  getSimilarityWord(word1: string, word2: string, corpus?: Corpus): number{
    return queryUtils.getSimilarityWord(word1, word2, this.usedCorpus(corpus));
  }

  /**
   * Calculates the inner product of the cosine similarities of two word ids
   * @param id1     The first text id
   * @param id2     The second text id
   * @param corpus  Optional corpus, defaults to the global one
   */
  innerProduct(id1, id2, corpus?: Corpus): number{
    return queryUtils.innerProduct(id1, id2, this.usedCorpus(corpus));
  }

  /**
   * Calculates the inner product of the cosine similarity of one word id
   * @param id      The text id
   * @param corpus  Optional corpus, defaults to the global one
   */
  innerProductSingle(id, corpus?: Corpus): number {
    return queryUtils.innerProductSingle(id, this.usedCorpus(corpus));
  }

  /**
   * Returns the soft cosine normalization of two word ids
   * @param id1     The first text id
   * @param id2     The second text id
   * @param corpus  Optional corpus, defaults to the global one
   */
  softCosineMeasureNorm(id1, id2, corpus?: Corpus): number{
    return queryUtils.softCosineMeasureNorm(id1, id2, this.usedCorpus(corpus));
  }

  /**
   * Returns the soft cosine measure of two texts
   * @param id1     The first text id
   * @param id2     The second text id
   * @param corpus  Optional corpus, defaults to the global one
   */
  getSoftCosineMeasure(id1: string, id2: string, corpus?: Corpus): number {
    return queryUtils.getSoftCosineMeasure(id1, id2, this.usedCorpus(corpus));
  }

  /**
   * Returns the document text
   * @param id      The first text id
   * @param corpus  Optional corpus, defaults to the global one
   */
  getDocumentText(id: string, corpus?: Corpus): string{
    return queryUtils.getDocumentText(id, this.usedCorpus(corpus));
  }

  /**
   * Returns the normalized pairs of word importances
   * @param id1     The first text id
   * @param id2     The second text id
   * @param corpus  Optional corpus, defaults to the global one
   */
  getNormalizedWordImportancePairs(id1: string, id2: string, corpus?: Corpus): {[key: string]: number}{
    return queryUtils.getNormalizedWordImportancePairs(id1, id2, this.usedCorpus(corpus));
  }

  /**
   * Returns an observable kickstarting the WebWorker to generate GraphData upon subscription
   * @param corpus  Optional corpus, defaults to the global one
   */
  initGraphData(corpus?: Corpus): Observable<GraphData>{
    // Tell the loading service that we started loading
    this.loadingService.setIsLoading(true);
    // Create an observable that observes the worker data, firing every time theres a change
    const observable = this.workerData.asObservable()
      .pipe(
        // Look at the data the worker passed in and give the loading service the loading stage and progress
        tap(progress => {
          this.loadingService.setLoadingStage(progress.stage);
          this.loadingService.setLoadingProgress(progress.value);
        }),
        // If the web worker data has the final processed data
        filter(data => data.data),
        // We finally tell the loading service we're done loading and return the output data
        map(data => {
          this.loadingService.setIsLoading(false);
          return data.data;
        })
      );
    // Tell the web worker to start processing
    this.worker.postMessage({query: this.usedCorpus(corpus)});
    return observable;
  }
}
