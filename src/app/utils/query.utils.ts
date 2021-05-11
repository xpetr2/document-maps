import {Observable} from 'rxjs';
import {pairSeparator} from './various.utils';

/**
 * The main corpus interface
 */
export interface Corpus {
  dictionary: {[key: string]: string};
  results: {[key: string]: string[]};
  texts: {[key: string]: string[]};
  texts_bow: {[key: string]: {[key: string]: number}};
  version: string;
  word_similarities: {[key: string]: {[key: string]: number}};
}

/**
 * An interface, specifying information about a node in the D3 graph, indirectly inherits from SimulationNodeDatum
 */
export interface GraphNode {
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

/**
 * An interface, specifying information about a node in the D3 graph, indirectly inherits from SimulationLinkDatum
 */
export interface GraphLink {
  source: string;
  target: string;
  value: number;
  index?: number;
}

/**
 * An interface, containing the arrays of GraphNodes and GraphLinks passed to the D3 simulation
 */
export interface GraphData{
  nodes: GraphNode[];
  links: GraphLink[];
}

/**
 * Returns the ID of a given word
 * @param word    The word to retrieve the id of
 * @param corpus  The corpus to perform the query on
 */
export function getWordId(word: string, corpus: Corpus): string {
  return Object.keys(corpus.dictionary).find(key => corpus.dictionary[key] === word);
}

/**
 * Returns the word from dictionary of a given id
 * @param id      The id to retrieve the word of
 * @param corpus  The corpus to perform the query on
 */
export function getWord(id: string, corpus: Corpus): string {
  return corpus.dictionary[id];
}

/**
 * Returns the cosine similarity of two word ids
 * @param id1     The first id to compare
 * @param id2     The second id to compare
 * @param corpus  The corpus to perform the query on
 */
export function getSimilarity(id1: string, id2: string, corpus: Corpus): number {
  if (id1 === id2) {
    return 1.0;
  }
  if (+id1 > +id2) {
    id2 = [id1, id1 = id2][0];
  }
  if (!(id1 in corpus.word_similarities) || !(id2 in corpus.word_similarities[id1])) {
    return 0.0;
  }
  return corpus.word_similarities[id1][id2];
}

/**
 * Returns the cosine similarity of two words
 * @param word1   The first word to compare
 * @param word2   The second word to compare
 * @param corpus  The corpus to perform the query on
 */
export function getSimilarityWord(word1: string, word2: string, corpus: Corpus): number{
  const w1 = getWordId(word1, corpus);
  const w2 = getWordId(word2, corpus);
  return getSimilarity(w1, w2, corpus);
}

/**
 * Calculates the inner product of the cosine similarities of two word ids
 * @param id1     The first text id
 * @param id2     The second text id
 * @param corpus  The corpus to perform the query on
 */
export function innerProduct(id1, id2, corpus: Corpus): number{
  const entries1 = Object.entries(corpus.texts_bow[id1]);
  const entries2 = Object.entries(corpus.texts_bow[id2]);
  let similarity = 0.0;
  for (const [w1ID, w1Weight] of entries1){
    for (const [w2ID, w2Weight] of entries2){
      similarity += getSimilarity(w1ID, w2ID, corpus) * w1Weight * w2Weight;
    }
  }
  return similarity;
}

/**
 * Calculates the inner product of the cosine similarity of one word id
 * @param id      The text id
 * @param corpus  The corpus to perform the query on
 */
export function innerProductSingle(id, corpus: Corpus): number {
  const entries = Object.entries(corpus.texts_bow[id]);
  let similarity = 0.0;
  for (let i = 0; i < entries.length; i++){
    for (let j = i; j < entries.length; j++){
      const [w1ID, w1Weight] = entries[i];
      const [w2ID, w2Weight] = entries[j];
      similarity += getSimilarity(w1ID, w2ID, corpus) * w1Weight * w2Weight * (i === j ? 1 : 2);
    }
  }
  return similarity;
}

/**
 * Returns the soft cosine normalization of two word ids
 * @param id1     The first text id
 * @param id2     The second text id
 * @param corpus  The corpus to perform the query on
 */
export function softCosineMeasureNorm(id1, id2, corpus: Corpus): number{
  let norm = 1.0;
  norm *= innerProductSingle(id1, corpus) || 1.0;
  norm *= innerProductSingle(id2, corpus) || 1.0;
  norm = Math.sqrt(norm);
  return norm;
}

/**
 * Returns the soft cosine measure of two texts
 * @param id1     The first text id
 * @param id2     The second text id
 * @param corpus  The corpus to perform the query on
 */
export function getSoftCosineMeasure(id1: string, id2: string, corpus: Corpus): number {
  let textSimilarity = innerProduct(id1, id2, corpus);
  textSimilarity /= softCosineMeasureNorm(id1, id2, corpus);
  return textSimilarity;
}

/**
 * Returns the document text
 * @param id      The first text id
 * @param corpus  The corpus to perform the query on
 */
export function getDocumentText(id: string, corpus: Corpus): string{
  const text = corpus.texts[id].map(word => getWord(word, corpus));
  return text.join(' ');
}

/**
 * Returns the normalized word importance pairs
 * @param id1     The first text id
 * @param id2     The second text id
 * @param corpus  The corpus to perform the query on
 */
export function getNormalizedWordImportancePairs(id1: string, id2: string, corpus: Corpus): {[key: string]: number}{
  const bowEntries1 = Object.entries(corpus.texts_bow[id1]);
  const bowEntries2 = Object.entries(corpus.texts_bow[id2]);

  const wordPairs = getWordImportancePairs(bowEntries1, bowEntries2, corpus);
  const norm = softCosineMeasureNorm(id1, id2, corpus);
  const normWordPairs: {[key: string]: number} = {};
  const wordPairsKeys = Object.keys(wordPairs);
  for (const id of wordPairsKeys){
    normWordPairs[id] = wordPairs[id] / norm;
  }
  return normWordPairs;
}

/**
 * Returns the non-normalized word importance pairs
 * @param bowEntries1 The key-value pairs of the bag of word of the first document
 * @param bowEntries2 The key-value pairs of the bag of word of the second document
 * @param corpus      The corpus to perform the query on
 */
function getWordImportancePairs(bowEntries1: [string, number][], bowEntries2: [string, number][], corpus: Corpus): {[key: string]: number}{
  const wordPairs: {[key: string]: number} = {};
  for (const [wID1, wWeight1] of bowEntries1) {
    for (const [wID2, wWeight2] of bowEntries2) {
      const wordSimilarity = getSimilarity(wID1, wID2, corpus);
      const importance = wWeight1 * wordSimilarity * wWeight2;
      if (importance === 0) {
        continue;
      }
      const word1 = getWord(wID1, corpus);
      const word2 = getWord(wID2, corpus);
      const wordsKey = `${word1}${pairSeparator}${word2}`;
      if (!Object.keys(wordPairs).includes(wordsKey)){
        wordPairs[wordsKey] = 0.0;
      }
      wordPairs[wordsKey] += importance;
    }
  }
  return wordPairs;
}

/**
 * Filters through the word importance pairs and returns only exact matches
 * @param wordImportancePairs The pairs to filter through
 */
export function getMostImportantExactMatches(wordImportancePairs: any): any{
  const keys = Object.keys(wordImportancePairs);
  const exactMatches = {};
  for (const id of keys){
    const ids = id.split(pairSeparator);
    if (ids[0] === ids[1]){
      exactMatches[ids[0]] = wordImportancePairs[id];
    }
  }
  return exactMatches;
}

/**
 * Filters through the word importance pairs and returns only soft matches
 * @param wordImportancePairs The pairs to filter through
 */
export function getMostImportantSoftMatches(wordImportancePairs: any): any{
  const keys = Object.keys(wordImportancePairs);
  const softMatches = {};
  for (const id of keys){
    const ids = id.split(pairSeparator);
    if (ids[0] !== ids[1]){
      softMatches[id] = wordImportancePairs[id];
    }
  }
  return softMatches;
}

/**
 * Cosine distance calculation formula with modifiers
 * @param weight      The cosine similarity of two documents
 * @param multiplier  The linear multiplier of the formula
 * @param clumping    The exponent of the formula
 */
export function calculateCosineDistance(weight: number, multiplier: number = 1, clumping: number = 1): number{
  return Math.pow(1 - weight, clumping) * multiplier;
}

/**
 * An observable, responsible for creating the GraphNode elements
 * @param corpus  The corpus to create the nodes from
 */
export function createNodes(corpus: Corpus): Observable<{progress: number, data?: GraphNode[]}>{
  return new Observable<{progress: number; data?: GraphNode[]}>(subscriber => {
    const entries = Object.entries(corpus.results);
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

/**
 * An observable, responsible for creating the GraphLinks and calculating the cosine similarity of it
 * @param nodes   The GraphNodes to create the links between
 * @param corpus  The corpus to create the nodes from
 */
export function createLinks(nodes: GraphNode[], corpus: Corpus): Observable<{progress: number, data?: GraphLink[]}>{
  return new Observable<{progress: number; data?: GraphLink[]}>(subscriber => {
    const links: GraphLink[] = [];
    for (let i = 0; i < nodes.length; i++) {
      subscriber.next({progress: (i / nodes.length) * 100});
      for (let j = (i + 1); j < nodes.length; j++) {
        const key1 = nodes[i].id;
        const key2 = nodes[j].id;
        const scm = getSoftCosineMeasure(key1, key2, corpus);
        links.push({source: key1, target: key2, value: scm});
      }
    }
    subscriber.next({progress: 100, data: links});
    subscriber.complete();
  });
}
