import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

export interface SearchQuery{
  dictionary: {[key: string]: string};
  results: {[key: string]: string[]};
  texts: {[key: string]: string[]};
  texts_bow: {[key: string]: {[key: string]: number}};
  version: string;
  word_similarities: {[key: string]: {[key: string]: number}};
}

@Injectable({
  providedIn: 'root'
})
export class QueryService {
  private querySource = new BehaviorSubject<SearchQuery>(undefined);
  currentQuery = this.querySource.asObservable();

  constructor() { }

  setQuery(query: SearchQuery): void{
    this.querySource.next(query);
  }

  getWordId(word: string, query?: SearchQuery): string {
    if (!query && !this.querySource.getValue()){
      return undefined;
    }
    const usedQuery = query ? query : this.querySource.getValue();

    return Object.keys(usedQuery.dictionary).find(key => usedQuery.dictionary[key] === word);
  }

  getWord(wordID: string, query?: SearchQuery): string {
    if (!query && !this.querySource.getValue()){
      return undefined;
    }
    const usedQuery = query ? query : this.querySource.getValue();

    if (!usedQuery && !this.querySource.getValue()){
      return undefined;
    }
    return usedQuery.dictionary[wordID];
  }

  getSimilarity(w1: string, w2: string, query?: SearchQuery): number {
    if (!query && !this.querySource.getValue()){
      return undefined;
    }
    const usedQuery = query ? query : this.querySource.getValue();

    if (w1 === w2) {
      return 1.0;
    }
    if (+w1 > +w2) {
      w2 = [w1, w1 = w2][0];
    }
    if (!(w1 in usedQuery.word_similarities) || !(w2 in usedQuery.word_similarities[w1])) {
      return 0.0;
    }
    return usedQuery.word_similarities[w1][w2];
  }

  getSimilarityWord(word1: string, word2: string, query?: SearchQuery): number{
    if (!query && !this.querySource.getValue()){
      return undefined;
    }
    const usedQuery = query ? query : this.querySource.getValue();

    const w1 = this.getWordId(word1, usedQuery);
    const w2 = this.getWordId(word2, usedQuery);
    return this.getSimilarity(w1, w2, usedQuery);
  }

  innerProduct(t1, t2, query?: SearchQuery): number{
    if (!query && !this.querySource.getValue()){
      return undefined;
    }
    const usedQuery = query ? query : this.querySource.getValue();

    const entries1 = Object.entries(usedQuery.texts_bow[t1]);
    const entries2 = Object.entries(usedQuery.texts_bow[t2]);
    let similarity = 0.0;
    for (const [w1ID, w1Weight] of entries1){
      for (const [w2ID, w2Weight] of entries2){
        similarity += this.getSimilarity(w1ID, w2ID, usedQuery) * w1Weight * w2Weight;
      }
    }
    return similarity;
  }

  innerProductSingle(t, query?: SearchQuery): number {
    if (!query && !this.querySource.getValue()){
      return undefined;
    }
    const usedQuery = query ? query : this.querySource.getValue();

    const entries = Object.entries(usedQuery.texts_bow[t]);
    let similarity = 0.0;
    for (let i = 0; i < entries.length; i++){
      for (let j = i; j < entries.length; j++){
        const [w1ID, w1Weight] = entries[i];
        const [w2ID, w2Weight] = entries[j];
        similarity += this.getSimilarity(w1ID, w2ID, usedQuery) * w1Weight * w2Weight * (i === j ? 1 : 2);
      }
    }
    return similarity;
  }

  softCosineMeasureNorm(t1, t2, query?: SearchQuery): number{
    if (!query && !this.querySource.getValue()){
      return undefined;
    }
    const usedQuery = query ? query : this.querySource.getValue();

    let norm = 1.0;
    norm *= this.innerProductSingle(t1, usedQuery) || 1.0;
    norm *= this.innerProductSingle(t2, usedQuery) || 1.0;
    norm = Math.sqrt(norm);
    return norm;
  }

  getSoftCosineMeasure(textID1: string, textID2: string, query?: SearchQuery): number {
    if (!query && !this.querySource.getValue()){
      return undefined;
    }
    const usedQuery = query ? query : this.querySource.getValue();

    let textSimilarity = this.innerProduct(textID1, textID2, usedQuery);
    textSimilarity /= this.softCosineMeasureNorm(textID1, textID2, usedQuery);
    return textSimilarity;
  }

  getDocumentText(textID: string, query?: SearchQuery): string{
    if (!query && !this.querySource.getValue()){
      return undefined;
    }
    const usedQuery = query ? query : this.querySource.getValue();

    const text = usedQuery.texts[textID].map(word => this.getWord(word, usedQuery));
    return text.join(' ');
  }

  getNormalizedWordImportancePairs(text1: string, text2: string, query?: SearchQuery): any{
    if (!query && !this.querySource.getValue()){
      return undefined;
    }
    const usedQuery = query ? query : this.querySource.getValue();

    const bow1 = usedQuery.texts_bow[text1];
    const bow2 = usedQuery.texts_bow[text2];
    const wordPairs = {};
    const bowEntries1 = Object.entries(bow1);
    const bowEntries2 = Object.entries(bow2);
    for (const [wID1, wWeight1] of bowEntries1) {
      for (const [wID2, wWeight2] of bowEntries2) {
        const wordSimilarity = this.getSimilarity(wID1, wID2, usedQuery);
        const importance = wWeight1 * wordSimilarity * wWeight2;
        if (importance === 0) {
          continue;
        }
        const word1 = this.getWord(wID1, usedQuery);
        const word2 = this.getWord(wID2, usedQuery);
        const wordsKey = `${word1}\0${word2}`;
        if (!Object.keys(wordPairs).includes(wordsKey)){
          wordPairs[wordsKey] = 0.0;
        }
        wordPairs[wordsKey] += importance;
      }
    }
    const norm = this.getSoftCosineMeasure(text1, text2, usedQuery);
    const normWordPairs = {};
    const wordPairsKeys = Object.keys(wordPairs);
    for (const id of wordPairsKeys){
      normWordPairs[id] = wordPairs[id] / norm;
    }
    return normWordPairs;
  }

  getMostImportantExactMatches(wordImportancePairs: any): any{
    const keys = Object.keys(wordImportancePairs);
    const exactMatches = {};
    for (const id of keys){
      const ids = id.split('\0');
      if (ids[0] === ids[1]){
        exactMatches[ids[0]] = wordImportancePairs[id];
      }
    }
    return exactMatches;
  }

  getMostImportantSoftMatches(wordImportancePairs: any): any{
    const keys = Object.keys(wordImportancePairs);
    const softMatches = {};
    for (const id of keys){
      const ids = id.split('\0');
      if (ids[0] !== ids[1]){
        softMatches[id] = wordImportancePairs[id];
      }
    }
    return softMatches;
  }
}
