import {Observable} from 'rxjs';

export interface SearchQuery{
  dictionary: {[key: string]: string};
  results: {[key: string]: string[]};
  texts: {[key: string]: string[]};
  texts_bow: {[key: string]: {[key: string]: number}};
  version: string;
  word_similarities: {[key: string]: {[key: string]: number}};
}

export interface GraphNode{
  id: string;
  group: number;

  index?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink{
  source: string;
  target: string;
  value: number;
  index?: number;
}

export interface GraphData{
  nodes: GraphNode[];
  links: GraphLink[];
}

export function getWordId(word: string, query: SearchQuery): string {
  return Object.keys(query.dictionary).find(key => query.dictionary[key] === word);
}

export function getWord(wordID: string, query: SearchQuery): string {
  return query.dictionary[wordID];
}

export function getSimilarity(w1: string, w2: string, query: SearchQuery): number {
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

export function getSimilarityWord(word1: string, word2: string, query: SearchQuery): number{
  const w1 = getWordId(word1, query);
  const w2 = getWordId(word2, query);
  return getSimilarity(w1, w2, query);
}

export function innerProduct(t1, t2, query: SearchQuery): number{
  const entries1 = Object.entries(query.texts_bow[t1]);
  const entries2 = Object.entries(query.texts_bow[t2]);
  let similarity = 0.0;
  for (const [w1ID, w1Weight] of entries1){
    for (const [w2ID, w2Weight] of entries2){
      similarity += getSimilarity(w1ID, w2ID, query) * w1Weight * w2Weight;
    }
  }
  return similarity;
}

export function innerProductSingle(t, query: SearchQuery): number {
  const entries = Object.entries(query.texts_bow[t]);
  let similarity = 0.0;
  for (let i = 0; i < entries.length; i++){
    for (let j = i; j < entries.length; j++){
      const [w1ID, w1Weight] = entries[i];
      const [w2ID, w2Weight] = entries[j];
      similarity += getSimilarity(w1ID, w2ID, query) * w1Weight * w2Weight * (i === j ? 1 : 2);
    }
  }
  return similarity;
}

export function softCosineMeasureNorm(t1, t2, query: SearchQuery): number{
  let norm = 1.0;
  norm *= innerProductSingle(t1, query) || 1.0;
  norm *= innerProductSingle(t2, query) || 1.0;
  norm = Math.sqrt(norm);
  return norm;
}

export function getSoftCosineMeasure(textID1: string, textID2: string, query: SearchQuery): number {
  let textSimilarity = innerProduct(textID1, textID2, query);
  textSimilarity /= softCosineMeasureNorm(textID1, textID2, query);
  return textSimilarity;
}

export function getDocumentText(textID: string, query: SearchQuery): string{
  const text = query.texts[textID].map(word => getWord(word, query));
  return text.join(' ');
}

export function getNormalizedWordImportancePairs(text1: string, text2: string, query: SearchQuery): {[key: string]: number}{
  const bow1 = query.texts_bow[text1];
  const bow2 = query.texts_bow[text2];
  console.log(JSON.stringify({bow1, bow2}));
  const wordPairs: {[key: string]: number} = {};
  const bowEntries1 = Object.entries(bow1);
  const bowEntries2 = Object.entries(bow2);
  for (const [wID1, wWeight1] of bowEntries1) {
    for (const [wID2, wWeight2] of bowEntries2) {
      const wordSimilarity = getSimilarity(wID1, wID2, query);
      const importance = wWeight1 * wordSimilarity * wWeight2;
      if (importance === 0) {
        continue;
      }
      const word1 = getWord(wID1, query);
      const word2 = getWord(wID2, query);
      const wordsKey = `${word1}\0${word2}`;
      if (!Object.keys(wordPairs).includes(wordsKey)){
        wordPairs[wordsKey] = 0.0;
      }
      wordPairs[wordsKey] += importance;
    }
  }
  const norm = softCosineMeasureNorm(text1, text2, query);
  const normWordPairs: {[key: string]: number} = {};
  const wordPairsKeys = Object.keys(wordPairs);
  for (const id of wordPairsKeys){
    normWordPairs[id] = wordPairs[id] / norm;
  }
  return normWordPairs;
}

export function getMostImportantExactMatches(wordImportancePairs: any): any{
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

export function getMostImportantSoftMatches(wordImportancePairs: any): any{
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

export function calculateCosineDistance(weight: number, multiplier: number = 1, clumping: number = 1): number{
  return Math.pow(1 - weight, clumping) * multiplier;
}

export function createNodes(query: SearchQuery): Observable<{progress: number, data?: GraphNode[]}>{
  return new Observable<{progress: number; data?: GraphNode[]}>(subscriber => {
    const entries = Object.entries(query.results);
    const nodes: GraphNode[] = [];
    let i = 0;
    for (const [id, docs] of entries){
      subscriber.next({progress: (i / entries.length) * 100});
      const node = {id, group: 1};
      nodes.push(node);
      for (const d of docs) {
        const doc = {id: d, group: 2};
        nodes.push(doc);
      }
      i++;
    }
    subscriber.next({progress: 100, data: nodes});
    subscriber.complete();
  });
}

export function createLinks(nodes: GraphNode[], query: SearchQuery): Observable<{progress: number, data?: GraphLink[]}>{
  return new Observable<{progress: number; data?: GraphLink[]}>(subscriber => {
    const links: GraphLink[] = [];
    for (let i = 0; i < nodes.length; i++) {
      subscriber.next({progress: (i / nodes.length) * 100});
      for (let j = (i + 1); j < nodes.length; j++) {
        const key1 = nodes[i].id;
        const key2 = nodes[j].id;
        const scm = getSoftCosineMeasure(key1, key2, query);
        links.push({source: key1, target: key2, value: scm});
      }
    }
    subscriber.next({progress: 100, data: links});
    subscriber.complete();
  });
}
