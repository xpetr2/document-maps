import {Component,  OnInit, ViewChild} from '@angular/core';
import * as DocumentJson from '../document.json';
import {QueryService, SearchQuery} from '../services/query.service';
import {SimulationLinkDatum, SimulationNodeDatum} from 'd3';
import {MatDrawer} from '@angular/material/sidenav';
import {SelectedDocument, SidenavComponent} from './sidenav/sidenav.component';
import {GraphComponent} from './graph/graph.component';
import {AppSettings} from './settings/settings.component';

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

export interface Color{
  r: number;
  g: number;
  b: number;
  a?: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  searchQuery: SearchQuery;
  graphData: GraphData = undefined;
  nodes: any = {};
  linkMin = 1;
  linkMax = -1;

  minZoom = 1;
  maxZoom = 32;
  currentZoom = this.pow2(2.5);
  defaultStepZoom = 0.25;

  selectedNodes: string[] = [];
  selectedDocuments: SelectedDocument[] = [];

  comparingWindowOpen = false;
  settingsOpen = false;
  settings: AppSettings = {
    showLabels: true
  };
  wordPairs: {};

  @ViewChild('drawer') matDrawer: MatDrawer;
  @ViewChild('sidenav') sidenav: SidenavComponent;
  @ViewChild('graph') graph: GraphComponent;

  constructor(private queryService: QueryService) { }

  ngOnInit(): void {
    this.searchQuery = (DocumentJson as any).default;
    const keys = Object.entries(this.searchQuery.results);
    const ae = {};
    for (let i = 0; i < 5; i++){
      const [k, v] = keys[i];
      ae[k] = v;
    }
    this.searchQuery.results = ae;
    console.log(this.searchQuery);

    const nodes = this.createNodes(this.searchQuery);
    console.log(nodes);
    const links = this.createLinks(this.searchQuery);
    console.log(links);
    this.graphData = {nodes, links};
  }

  createNodes(query: SearchQuery): GraphNode[]{
    const nodes: GraphNode[] = [];
    const entries = Object.entries(query.results);
    for (const [id, docs] of entries){
      const node = {id, group: 1};
      nodes.push(node);
      for (const d of docs) {
        const doc = {id: d, group: 2};
        nodes.push(doc);
        this.nodes[d] = {node: doc, type: 'document'};
      }
      this.nodes[id] = {node, type: 'query'};
    }
    return nodes;
  }

  createLinks(query: SearchQuery): GraphLink[]{
    const links: GraphLink[] = [];
    const documents = Object.keys(this.nodes);
    console.log(documents);
    const t0 = performance.now();
    let min = 1;
    let max = 0;
    for (let i = 0; i < documents.length; i++) {
      for (let j = (i + 1); j < documents.length; j++) {
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
    const re = /^node_\d+_(.*)$/;
    const id = ($event.click.target) ? re.exec(($event.click.target as any).id)[1] : undefined;
    const oldSelection = this.selectedNodes.slice();
    this.matDrawer.open();
    this.comparingWindowOpen = false;
    if (id) {
      if (this.selectedNodes.length === 1 && this.selectedNodes[0] === id){
        this.selectedNodes = [];
      } else if ($event.click.ctrlKey) {
        const nodeInArray = this.selectedNodes.indexOf(id);
        if (nodeInArray >= 0){
          this.selectedNodes.splice(nodeInArray, 1);
        } else {
          this.selectedNodes.push(id);
        }
      } else {
        this.selectedNodes = [id];
      }
    }
    if (this.selectedNodes.length === 0){
      this.matDrawer.close();
    }
    this.redrawSelection(oldSelection, $event.d3);
    this.generateSelectedDocuments();
    this.sidenav.clearHighlightedWords();
  }

  generateSelectedDocuments(): void{
    this.selectedDocuments = [];
    for (const id of this.selectedNodes){
      const title = `Document ${id}`;
      const subtitle = `${id}`;
      const content = this.queryService.getDocumentText(id, this.searchQuery);
      this.selectedDocuments.push({id, title, subtitle, content});
    }
  }

  redrawSelection(oldSelection: string[], d3: any): void {
    if (this.selectedNodes.length === 1){
      this.drawDeviation(this.selectedNodes[0], d3);
    } else {
      this.clearDeviation(d3);
    }
    for (const id of oldSelection){
      d3.select(`[id^="node_"][id$="${id.replace('.', '\\.')}"]`).attr('class', '');
    }
    for (const id of this.selectedNodes){
      d3.select(`[id^="node_"][id$="${id.replace('.', '\\.')}"]`).attr('class', 'selected');
    }
  }

  clearSelection(event: any): void{
    const oldSelection = this.selectedNodes;
    this.selectedNodes = [];
    this.matDrawer.close();
    this.comparingWindowOpen = false;
    this.redrawSelection(oldSelection, event.d3);
    this.generateSelectedDocuments();
    this.sidenav.clearHighlightedWords();
  }

  calculateDeviation(sourceNode: any, targetNode: any, sourceID: string, targetID: string): number{
    // todo: calculate using  cosine distance
    const sPos = (sourceNode.attr('transform') as string).match(/translate\(([^,]+), ([^,)]+)\)/);
    const tPos = (targetNode.attr('transform') as string).match(/translate\(([^,]+), ([^,)]+)\)/);
    const sX = parseFloat(sPos[1]);
    const sY = parseFloat(sPos[2]);
    const tX = parseFloat(tPos[1]);
    const tY = parseFloat(tPos[2]);
    const distance = Math.sqrt( (sX - tX) * (sX - tX) + (sY - tY) * (sY - tY) );
    const supposedDistance = (1 / this.queryService.getSoftCosineMeasure(sourceID, targetID, this.searchQuery)) - 1;
    return this.normalizeDeviation(supposedDistance - distance);
  }

  normalizeDeviation(x: number): number{
    const stiffness = 0.1;
    return ((1 + x / (1 + Math.abs(x * stiffness))) - 1)  * stiffness;
  }

  colorGradient(color1: Color, color2: Color, gradient: number): Color {
    const r = color1.r + gradient * (color2.r - color1.r);
    const g = color1.g + gradient * (color2.g - color1.g);
    const b = color1.b + gradient * (color2.b - color1.b);
    return {r, g, b};
  }

  colorToHex(color: Color): string{
    const r = (color.r >> 0).toString(16);
    const g = (color.g >> 0).toString(16);
    const b = (color.b >> 0).toString(16);
    return `#${(r.length === 2 ? r : '0' + r)}${(g.length === 2 ? g : '0' + g)}${(b.length === 2 ? b : '0' + b)}`;
  }

  drawDeviation(selectedNode: string, d3: any): void{
    const entries = Object.entries(this.nodes);
    for (const [id, ] of entries){
      if (id === selectedNode) {
        continue;
      }
      const targetNode = d3.select(`[id="wrapper_${id.replace('.', '\\.')}"]`);
      const sourceNode = d3.select(`[id="wrapper_${selectedNode.replace('.', '\\.')}"]`);
      const deviation = this.calculateDeviation(sourceNode, targetNode, selectedNode, id);
      const correctColor = {r: 55, g: 176, b: 59};
      const farColor = {r: 176, g: 55, b: 55};
      const closeColor = {r: 69, g: 55, b: 176};
      const color = this.colorToHex(this.colorGradient(correctColor, deviation < 0 ? closeColor : farColor, Math.abs(deviation)));
      targetNode.select('circle').attr('fill', color);
    }
  }

  clearDeviation(d3: any): void{
    d3.selectAll(`[id^="node_2_"]`).attr('fill', '#673ab7');
    d3.selectAll(`[id^="node_1_"]`).attr('fill', '#ffd740');
  }

  handleCompareClick(): void{
    this.comparingWindowOpen = !this.comparingWindowOpen;
  }

  centerCamera(): void{
    this.graph.centerCamera(0, 0, this.currentZoom);
  }

  increaseCamera(): void{
    this.changeCamera(this.pow2(this.log2(this.currentZoom) + this.defaultStepZoom));
  }

  decreaseCamera(): void{
    this.changeCamera(this.pow2(this.log2(this.currentZoom) - this.defaultStepZoom));
  }

  changeCamera(value: number): void{
    value = Math.max(Math.min(value, this.maxZoom), this.minZoom);
    this.currentZoom = value;
    this.graph.setZoom(value);
  }

  handleZoomed(e: any): void {
    this.currentZoom = e?.transform?.k ?? this.currentZoom;
  }

  handleDrawerClose(): void{
    this.matDrawer.close();
    this.sidenav.clearHighlightedWords();
  }

  handleGraphResize(): void{
    this.graph.detectChanges();
  }

  log2(n: number): number{
    return Math.log2(n);
  }

  pow2(n: number): number{
    return Math.pow(2, n);
  }
}
