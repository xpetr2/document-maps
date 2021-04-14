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

  getSoftCosineMeasure(textID1: string, textID2: string, query: SearchQuery): number
  {
    const innerProduct = (t1, t2) => {
      const entries1 = Object.entries(query.texts_bow[t1]);
      const entries2 = Object.entries(query.texts_bow[t2]);
      let similarity = 0.0;
      for (const [w1ID, w1Weight] of entries1){
        for (const [w2ID, w2Weight] of entries2){
          similarity += this.getSimilarity(w1ID, w2ID, query) * w1Weight * w2Weight;
        }
      }
      return similarity;
    };

    const innerProductSingle = (t) => {
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
    };

    const softCosineMeasureNorm = (t1, t2) => {
      let norm = 1.0;
      norm *= innerProductSingle(t1) || 1.0;
      norm *= innerProductSingle(t2) || 1.0;
      norm = Math.sqrt(norm);
      return norm;
    };

    let textSimilarity = innerProduct(textID1, textID2);
    textSimilarity /= softCosineMeasureNorm(textID1, textID2);
    return textSimilarity;
  }

  getDocumentText(textID: string, query: SearchQuery): string{
    const text = query.texts[textID].map(word => this.getWord(word, query));
    return text.join(' ');
  }
}
