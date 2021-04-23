import { Injectable } from '@angular/core';

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
  constructor() { }

  // todo: slow approach
  getWordId(word: string, query: SearchQuery): string {
    return Object.keys(query.dictionary).find(key => query.dictionary[key] === word);
  }

  getWord(wordID: string, query: SearchQuery): string {
    return query.dictionary[wordID];
  }

  getText(textID: string, query: SearchQuery): string{
    return '';
  }

  getSimilarity(w1: string, w2: string, query: SearchQuery): number {
    if (w1 === w2) {
      return 1.0;
    }
    if (+w1 > +w2) {
      w2 = [w1, w1 = w2][0];
    }
    if (!(w1 in query.word_similarities) || !(w2 in query.word_similarities[w1])) {
      return 0.0;
    }
    return query.word_similarities[w1][w2];
  }

  innerProduct(t1, t2, query: SearchQuery): number{
    const entries1 = Object.entries(query.texts_bow[t1]);
    const entries2 = Object.entries(query.texts_bow[t2]);
    let similarity = 0.0;
    for (const [w1ID, w1Weight] of entries1){
      for (const [w2ID, w2Weight] of entries2){
        similarity += this.getSimilarity(w1ID, w2ID, query) * w1Weight * w2Weight;
      }
    }
    return similarity;
  }

  innerProductSingle(t, query: SearchQuery): number {
    const entries = Object.entries(query.texts_bow[t]);
    let similarity = 0.0;
    for (let i = 0; i < entries.length; i++){
      for (let j = i; j < entries.length; j++){
        const [w1ID, w1Weight] = entries[i];
        const [w2ID, w2Weight] = entries[j];
        similarity += this.getSimilarity(w1ID, w2ID, query) * w1Weight * w2Weight * (i === j ? 1 : 2);
      }
    }
    return similarity;
  }

  softCosineMeasureNorm(t1, t2, query: SearchQuery): number{
    let norm = 1.0;
    norm *= this.innerProductSingle(t1, query) || 1.0;
    norm *= this.innerProductSingle(t2, query) || 1.0;
    norm = Math.sqrt(norm);
    return norm;
  }

  getSoftCosineMeasure(textID1: string, textID2: string, query: SearchQuery): number
  {
    let textSimilarity = this.innerProduct(textID1, textID2, query);
    textSimilarity /= this.softCosineMeasureNorm(textID1, textID2, query);
    return textSimilarity;
  }

  getDocumentText(textID: string, query: SearchQuery): string{
    const text = query.texts[textID].map(word => this.getWord(word, query));
    return text.join(' ');
  }

  getNormalizedWordImportancePairs(text1: string, text2: string, query: SearchQuery): any{
    const bow1 = query.texts_bow[text1];
    const bow2 = query.texts_bow[text2];
    const wordPairs = {};
    const bowEntries1 = Object.entries(bow1);
    const bowEntries2 = Object.entries(bow2);
    for (const [wID1, wWeight1] of bowEntries1) {
      for (const [wID2, wWeight2] of bowEntries2) {
        const wordSimilarity = this.getSimilarity(wID1, wID2, query);
        const importance = wWeight1 * wordSimilarity * wWeight2;
        if (importance === 0) {
          continue;
        }
        const word1 = this.getWord(wID1, query);
        const word2 = this.getWord(wID2, query);
        const wordsKey = `${word1}\0${word2}`;
        if (!Object.keys(wordPairs).includes(wordsKey)){
          wordPairs[wordsKey] = 0.0;
        }
        wordPairs[wordsKey] += importance;
      }
    }
    const norm = this.getSoftCosineMeasure(text1, text2, query);
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
