import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import * as d3 from 'd3';
import {GraphData, GraphNode} from '../home.component';
import {SimulationLinkDatum, SimulationNodeDatum, ZoomTransform} from 'd3';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {

  @Input() data: GraphData;
  @Input() width: number;
  @Input() height: number;
  @Input() minNormValue: number;
  @Input() maxNormValue: number;
  @Input() distanceModifier = 1;
  @Input() minZoom: number;
  @Input() maxZoom: number;
  @Input() startZoom: number;
  @Output() nodeClicked = new EventEmitter<any>();
  @Output() emptyClicked = new EventEmitter<any>();
  @Output() zoomed = new EventEmitter<any>();
  private svg: any;
  private g: any;
  private simulation: any;
  private zoom: any;
  nodes: any;

  constructor() { }

  ngOnInit(): void {
    this.initSimulation();
  }

  initSimulation(): void{
    this.simulation = d3.forceSimulation(this.data.nodes);
    this.simulation.force('link', d3.forceLink(this.data.links).id((d: GraphNode) => d.id)
        .distance(link => (this.distanceModifier / link.value - this.distanceModifier)))
      .force('charge', d3.forceManyBody()
        .strength(-1))
      .force('center', d3.forceCenter(0, 0));

    this.initSvg();
    this.drawGraph();
    this.centerCamera(0, 0, this.startZoom);
  }

  initSvg(): void{
    this.svg = d3.select('figure#graph')
      .append('svg')
      .attr('id', 'svg_wrapper')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', '0 0 960 500');

    this.g = this.svg.append('g');

    this.zoom = d3.zoom()
      .on('zoom', (e) => {
        if (e?.sourceEvent?.type === 'wheel' || e?.sourceEvent?.type === 'dblclick'){
          this.zoomed.emit(e);
        }
        this.g.attr('transform', e.transform);
      })

      .scaleExtent([this.minZoom, this.maxZoom]);

    this.svg.call(this.zoom);

    this.svg.on('click', (e) => {
      if (e.target.id === this.svg.attr('id')){
        this.emptyClicked.emit({click: e, d3});
      }
    });
  }

  drawGraph(): void{
    this.nodes = this.g.append('g')
      .selectAll('.node-group')
      .data(this.data.nodes)
      .enter().append('g')
      .attr('class', 'node-group');

    this.nodes.append('circle')
      .attr('r', 1)
      .attr('fill', c => c.group === 1 ? '#ffd740' : '#673ab7')
      .attr('id', c => `node_${c.group}_${c.id}`)
      .attr('z-index', '1')
      .on('click', (e) => {
        this.nodeClicked.emit({click: e, nodes: this.nodes, d3});
      });

    this.nodes.append('text')
      .attr('dx', 1.25)
      .attr('dy', '.35em')
      .attr('font-size', '0.075em')
      .attr('class', 'clickable-through node-label')
      .attr('z-index', '2')
      .text(c => c.id);

    this.nodes.select('node-label').raise();

    this.nodes.append('div')
      .attr('class', 'top-matches');

    this.simulation.on('tick', () => {
      this.nodes.attr('transform', d => `translate(${d.x}, ${d.y})`);
    });
  }

  centerCamera(x: number, y: number, k: number = 1): void {
    // this.g.node().getBBox()
    this.svg.call(this.zoom.scaleTo, k);
    this.svg.transition()
      .duration(250)
      .call(this.zoom.translateTo, x, y);
  }

  setZoom(value: number): void{
    this.svg.transition()
      .duration(250)
      .call(this.zoom.scaleTo, value);
  }
}
