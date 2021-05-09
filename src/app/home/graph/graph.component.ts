import {Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef, AfterViewInit} from '@angular/core';
import * as d3 from 'd3';
import {SimulationNodeDatum} from 'd3';
import {QueryService} from '../../services/query.service';
import * as queryUtils from '../../utils/query.utils';
import {GraphData, GraphLink, GraphNode} from '../../utils/query.utils';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() data: GraphData;
  @Input() width: number;
  @Input() height: number;
  @Input() distanceModifier = 1;
  @Input() clumpingModifier = 1;
  @Input() minZoom: number;
  @Input() maxZoom: number;
  @Input() defaultZoom: number;
  @Input() showLabels: boolean;
  @Input() graphPadding: number;

  @Output() nodeClicked = new EventEmitter<any>();
  @Output() emptyClicked = new EventEmitter<any>();
  @Output() nodeHovered = new EventEmitter<{nodeId: string, d3: any}>();
  @Output() zoomed = new EventEmitter<any>();

  private svg: any;
  private g: any;
  private simulation: any;
  private zoom: any;

  nodes: any;
  hoveredNode: string;
  linkForce: d3.ForceLink<SimulationNodeDatum, GraphLink>;

  constructor(
    private queryService: QueryService,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void{
    this.initSimulation();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.showLabels?.previousValue !== undefined && changes?.showLabels?.currentValue !== changes?.showLabels?.previousValue){
      const showLabels = changes?.showLabels?.currentValue;
      this.redrawLabels(showLabels);
    }

    const distanceModChanged = changes?.distanceModifier?.previousValue !== undefined &&
      changes?.distanceModifier?.currentValue !== changes?.distanceModifier?.previousValue;

    const clumpingModChanged = changes?.clumpingModifier?.previousValue !== undefined &&
      changes?.clumpingModifier?.currentValue !== changes?.clumpingModifier?.previousValue;

    if (distanceModChanged || clumpingModChanged){
      console.log(this.distanceModifier, this.clumpingModifier);
      this.simulation.force('link')
        .distance(this.calculateLinkDistance.bind(this));
      this.simulation.alpha(0.1).restart();
    }

    if (changes?.width?.previousValue !== undefined && changes?.width.currentValue !== changes?.width.previousValue ||
        changes?.height?.previousValue !== undefined && changes?.height.currentValue !== changes?.height.previousValue){
        this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`);
    }
  }

  initSimulation(): void{
    this.simulation = d3.forceSimulation(this.data.nodes);

    this.simulation.force('link', d3.forceLink(this.data.links)
        .id((d: GraphNode) => d.id)
        .distance(this.calculateLinkDistance.bind(this))
        .strength(1)
        .iterations(10))
      .force('charge', d3.forceManyBody()
        .strength(-10))
      .force('collide', d3.forceCollide()
        .strength(1)
        .iterations(10)
        .radius(1))
      .force('center', d3.forceCenter(0, 0)
        .strength(0));

    this.initSvg();
    this.drawGraph();
    this.centerCamera(0, 0, this.defaultZoom, 0);
    setTimeout(() => {
      this.setZoom(this.defaultZoom * this.calculateCoverZoom(), 1000);
    }, 0);
  }

  initSvg(): void{
    this.svg = d3.select('figure#graph')
      .append('svg')
      .attr('id', 'svg_wrapper')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`);

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
      .attr('id', c => `wrapper_${c.id}`)
      .attr('class', 'node-group');

    this.nodes.append('circle')
      .attr('r', 1)
      .attr('fill', c => c.group === 1 ? '#ffd740' : '#673ab7')
      .attr('id', c => `node_${c.group}_${c.id}`)
      .attr('z-index', '1')
      .on('click', (e) => {
        this.nodeClicked.emit({click: e, nodes: this.nodes, d3});
      })
      .on('mouseenter', (e) => {
        this.hoveredNode = e?.target?.id;
        this.nodeHovered.emit({nodeId: this.hoveredNode, d3});
      })
      .on('mouseleave', (e) => {
        this.hoveredNode = undefined;
        this.nodeHovered.emit({nodeId: this.hoveredNode, d3});
      });

    if (this.showLabels) {
      this.nodes.append('text')
        .attr('dx', 1.25)
        .attr('dy', '.35em')
        .attr('font-size', '0.075em')
        .attr('class', 'clickable-through node-label')
        .attr('z-index', '2')
        .text(c => c.id);

      this.nodes.select('node-label').raise();
    }

    // this.nodes.append('div')
    //   .attr('class', 'top-matches');

    this.simulation.on('tick', () => {
      this.nodes.attr('transform', d => `translate(${d.x}, ${d.y})`);
    });
  }

  redrawLabels(showLabels: boolean): void{
    if (showLabels) {
      this.nodes.append('text')
        .attr('dx', 1.25)
        .attr('dy', '.35em')
        .attr('font-size', '0.075em')
        .attr('class', 'clickable-through node-label')
        .attr('z-index', '2')
        .text(c => c.id);

      this.nodes.select('node-label').raise();
    } else {
      this.nodes.selectAll('text').remove();
    }
  }

  calculateCoverZoom(): number {
    const transform = this.g.node().getBoundingClientRect();
    const widthMult = (this.width - this.graphPadding) / transform.width;
    const heightMult = (this.height - this.graphPadding) / transform.height;
    return ((widthMult < heightMult) ? widthMult : heightMult);
  }

  centerCamera(x: number, y: number, k: number, duration = 250): void {
    const transform = this.g.node().getBoundingClientRect();
    const computedX = x;
    const computedY = y;
    this.svg.call(this.zoom.scaleTo, k);
    this.svg.transition()
      .duration(duration)
      .call(this.zoom.translateTo, computedX, computedY);
  }

  calculateLinkDistance(link: GraphLink): number{
    return queryUtils.calculateCosineDistance(link.value, this.distanceModifier, this.clumpingModifier);
  }

  setZoom(value: number, duration = 250): void{
    this.svg.transition()
      .duration(duration)
      .call(this.zoom.scaleTo, value);
  }

  detectChanges(): void{
    this.changeDetector.detectChanges();
    this.changeDetector.markForCheck();
  }
}
