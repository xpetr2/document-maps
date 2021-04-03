import {Component, HostListener, OnInit} from '@angular/core';
import * as DocumentJson from '../document.json';
import {QueryService, SearchQuery} from '../services/query.service';
import {SimulationLinkDatum, SimulationNodeDatum} from 'd3';

export interface GraphNode extends SimulationNodeDatum{
  id: string;
  group: number;
}

export interface GraphLink extends SimulationLinkDatum<GraphNode>{
  source: string;
  target: string;
  value: number;
}

export interface GraphData{
  nodes: GraphNode[];
  links: GraphLink[];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  searchQuery: SearchQuery;
  graphData: GraphData = undefined;
  nodes: any = {};
  linkMin = 1;
  linkMax = -1;

  constructor(private queryService: QueryService) { }

  ngOnInit(): void {
    this.searchQuery = (DocumentJson as any).default;
    let z = 0;
    const res: {[key: string]: string[]} = {};
    for (const [k, v] of Object.entries(this.searchQuery.results)){
      if (z > 100) {
        break;
      }
      res[k] = v;
      z++;
    }
    this.searchQuery.results = res;
    console.log(this.searchQuery);

    const w1 = this.queryService.getWordId('waclaw sierpinski', this.searchQuery);
    const w2 = this.queryService.getWordId('kuratowsky', this.searchQuery);
    const w3 = this.queryService.getWordId('spicy dishes', this.searchQuery);

    console.log(this.queryService.getSimilarity(w1, w1, this.searchQuery));
    console.log(this.queryService.getSimilarity(w1, w2, this.searchQuery));
    console.log(this.queryService.getSimilarity(w1, w3, this.searchQuery));

    const t1 = 'A.1';
    const t2 = '2805089';

    console.log(this.queryService.getSoftCosineMeasure(t1, t1, this.searchQuery));
    console.log(this.queryService.getSoftCosineMeasure(t2, t2, this.searchQuery));
    console.log(this.queryService.getSoftCosineMeasure(t1, t2, this.searchQuery));

    const nodes = this.createNodes(this.searchQuery);
    console.log(nodes);
    const links = this.createLinks(this.searchQuery);
    console.log(links);
    this.graphData = {nodes, links};
  }

  createNodes(query: SearchQuery): GraphNode[]{
    const nodes: GraphNode[] = [];
    for (const [qID, res] of Object.entries(query.results)){
      const node = {id: qID, group: 1};
      nodes.push(node);
      this.nodes[qID] = node;
      for (const dID of res){
        nodes.push({id: dID, group: 1});
      }
    }
    return nodes;
  }

  /*createLinks(query: SearchQuery): GraphLink[]{
    const links: GraphLink[] = [];
    const queryEntries = Object.entries(query.results);
    for (const [qID, res] of queryEntries){
      const iter = [qID, ...res];
      for (let i = 0; i < iter.length; i++){
        for (let j = (i + 1); j < iter.length; j++){
          const scm = this.queryService.getSoftCosineMeasure(iter[i], iter[j], query);
          links.push({source: iter[i], target: iter[j], value: scm});
        }
      }
    }
    let min = 10000;
    let max = -10000;
    for (let i = 0; i < queryEntries.length; i++){
      for (let j = (i + 1); j < queryEntries.length; j++){
        const [q1k, q1v] = queryEntries[i];
        const [q2k, q2v] = queryEntries[j];
        const scm = this.queryService.getSoftCosineMeasure(q1k, q2k, query);
        if (scm < min) {
          min = scm;
        }
        if (scm > max) {
          max = scm;
        }
        links.push({source: q1k, target: q2k, value: scm});
      }
    }
    this.linkMin = min;
    this.linkMax = max;
    return links;
  }*/

  createLinks(query: SearchQuery): GraphLink[]{
    const links: GraphLink[] = [];
    const documents = Object.keys(query.texts);
    console.log(documents);
    const t0 = performance.now();
    let min = 10000;
    let max = -10000;
    for (let i = 0; i < documents.length / 64; i++) {
      for (let j = (i + 1); j < documents.length / 64; j++) {
        const key1 = documents[i];
        const key2 = documents[j];
        const scm = this.queryService.getSoftCosineMeasure(key1, key2, query);
        if (scm < min) {
          min = scm;
        }
        if (scm > max) {
          max = scm;
        }
        links.push({source: key1, target: key2, value: scm});
      }
    }
    this.linkMin = min;
    this.linkMax = max;
    console.log(performance.now() - t0 + ' ms');
    return links;
  }

  handleNodeClick($event: any): void {
    const id = $event.target.computedName;
    console.log(id);
  }
}
