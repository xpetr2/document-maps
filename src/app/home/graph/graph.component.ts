import {Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef, AfterViewInit} from '@angular/core';
import * as d3 from 'd3';
import {QueryService} from '../../services/query.service';
import * as queryUtils from '../../utils/query.utils';
import {GraphData, GraphLink, GraphNode} from '../../utils/query.utils';
import {valueChanged} from '../../utils/various.utils';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnChanges, AfterViewInit {

  /**
   * Node and link data passed to D3
   */
  @Input() data: GraphData;
  /**
   * Width of current window
   */
  @Input() width: number;
  /**
   * Height of current window
   */
  @Input() height: number;
  /**
   * The modifier, that linearly scales the distance between two nodes
   */
  @Input() distanceModifier = 1;
  /**
   * The modifier, that exponentially scales the distance between two nodes
   */
  @Input() clumpingModifier = 1;
  /**
   * Minimal allowed zoom
   */
  @Input() minZoom: number;
  /**
   * Maximal allowed zoom
   */
  @Input() maxZoom: number;
  /**
   * Starting zoom, when the component is first loaded
   */
  @Input() defaultZoom: number;
  /**
   * The default amount the map should pan by using the arrow keys
   */
  @Input() defaultPanStep = 5;
  /**
   * The default amount the map should pan by using the arrow keys
   */
  @Input() defaultZoomStep = 0.25;
  /**
   * Specifies, whether labels for individual nodes should be rendered
   */
  @Input() showLabels: boolean;
  /**
   * On initialization, the camera attempts to keep the sides of the graph view empty by this amount
   */
  @Input() graphPadding: number;

  /**
   * Emits every time the user clicks on a node
   */
  @Output() nodeClicked = new EventEmitter<any>();
  /**
   * Emits every time the user clicks on nothing
   */
  @Output() emptyClicked = new EventEmitter<any>();
  /**
   * Emits every time the user hovers over a node
   */
  @Output() nodeHovered = new EventEmitter<{nodeId: string, d3: any}>();
  /**
   * Emits every time the user zooms the graph
   */
  @Output() zoomed = new EventEmitter<any>();
  /**
   * Emits every time the alpha, the temperature, of the simulation changes
   */
  @Output() alphaChanged = new EventEmitter<any>();

  /**
   * The SVG component holding all graph components
   * @private
   */
  private svg: any;
  /**
   * The SVG Group component holding the individual nodes
   * @private
   */
  private g: any;
  /**
   * The running D3 simulation
   * @private
   */
  private simulation: any;
  /**
   * The zoom behaviour applied to the graph
   * @private
   */
  private zoom: any;

  /**
   * The SVG element that stores the groups of nodes directly
   * @private
   */
  private nodes: any;
  /**
   * The ID of the currently hovered on node
   * @private
   */
  private hoveredNode: string;

  /**
   * Holds the previous alpha, the temperature, value of the graph
   * @private
   */
  private previousAlpha = 1;

  /**
   * @param queryService    the QueryService holding the corpus information
   * @param changeDetector  the ChangeDetectorRef responsible for updating the DOM
   */
  constructor(
    private queryService: QueryService,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void{
    this.initSimulation();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (valueChanged(changes?.showLabels)){
      this.drawLabels();
    }

    if (valueChanged(changes?.distanceModifier) || valueChanged(changes?.clumpingModifier)){
      this.simulation.force('link')
        .distance(this.calculateLinkDistance.bind(this));
      this.simulation.alpha(0.1).restart();
    }

    if (valueChanged(changes?.width) || valueChanged(changes?.height) ){
        this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`);
    }
  }

  /**
   * The initialization of the simulation
   */
  initSimulation(): void{
    this.simulation = d3.forceSimulation(this.data.nodes);

    this.initForces();
    this.initSvg();
    this.initEvents();
    this.drawGraph();

    // Center the camera, but wait with the zoom for a bit for the temperature of the simulation to settle down
    this.centerCamera(0, 0, this.defaultZoom, 0);
    setTimeout(() => {
      this.setZoom(this.defaultZoom * this.calculateCoverZoom(), 1000);
    }, 0);
  }

  /**
   * Initialize the forces applied to nodes
   */
  initForces(): void{
    this.simulation.force('link', d3.forceLink(this.data.links)
      .id((d: GraphNode) => d.id)
      .distance(this.calculateLinkDistance.bind(this))
      .strength(link => link.value)
      .iterations(10))
      .force('charge', d3.forceManyBody()
        .strength(-10))
      .force('collide', d3.forceCollide()
        .strength(1)
        .iterations(10)
        .radius(1))
      .force('center', d3.forceCenter(0, 0)
        .strength(0));
  }

  /**
   * Initialize the main SVG component of the graph
   */
  initSvg(): void{
    this.svg = d3.select('figure#graph')
      .append('svg')
      .attr('id', 'svg_wrapper')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`);

    this.g = this.svg.append('g');
  }

  /**
   * Initialize the behaviours and events of the graph
   */
  initEvents(): void{
    this.zoom = d3.zoom()
      .on('zoom', (e) => {
        this.zoomed.emit(e);
        this.g.attr('transform', e.transform);
      })
      .scaleExtent([this.minZoom, this.maxZoom]);

    this.svg.call(this.zoom);

    d3.select('body')
      .on('keydown', (e) => {
        if (e.key.startsWith('Arrow')){
          this.keyboardPan(e.key);
        } else if (e.key === '+' || e.key === '=' || e.key === '-') {
          this.keyboardZoom(e.key);
        }
      });

    this.svg.on('click', (e) => {
      if (e.target.id === this.svg.attr('id')){
        this.emptyClicked.emit({click: e, d3});
      }
    });
  }

  /**
   *  Draw the interactive part of the graph
   */
  drawGraph(): void{
    this.drawNodes();
    this.drawLabels();

    this.simulation.on('tick', () => {
      this.nodes.attr('transform', d => `translate(${d.x}, ${d.y})`);
      this.updateAlpha(0.001, 0.01);
    });
  }

  /**
   * Emits an event whenever the alpha, the temperature, of the simulation changes by a specific amount
   * @param minimumAlpha  The minimum alpha that the event will emit to
   * @param stepRequired The minimal step required between the last emission
   */
  updateAlpha(minimumAlpha: number, stepRequired: number): void{
    if (this.simulation.alpha() > minimumAlpha && Math.abs(this.previousAlpha - this.simulation.alpha()) > stepRequired ||
      this.simulation.alpha() === 0 && this.previousAlpha !== 0)
    {
      this.previousAlpha = this.simulation.alpha();
      this.alphaChanged.emit({value: this.simulation.alpha(), d3});
    }
  }

  /**
   * Draw the nodes on the graph and apply interaction events on them
   */
  drawNodes(): void{
    this.nodes = this.g.append('g')
      .selectAll('.node-group')
      .data(this.data.nodes)
      .enter().append('g')
      .attr('id', c => `wrapper_${c.id}`)
      .attr('class', 'node-group');

    this.nodes.append('circle')
      .attr('r', 1)
      .attr('id', c => `node_${c.group}_${c.id}`)
      .attr('z-index', '1')
      .on('click', (e) => {
        this.nodeClicked.emit({click: e, nodes: this.nodes, d3});
      })
      .on('mouseenter', (e) => {
        this.hoveredNode = e?.target?.id;
        this.nodeHovered.emit({nodeId: this.hoveredNode, d3});
      })
      .on('mouseleave', () => {
        this.hoveredNode = undefined;
        this.nodeHovered.emit({nodeId: this.hoveredNode, d3});
      });
  }

  /**
   * Draws the labels next to the nodes
   */
  drawLabels(): void{
    if (this.showLabels) {
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

  /**
   * Calculates the required zoom value to contain all the nodes on screen
   */
  calculateCoverZoom(): number {
    const transform = this.g.node().getBoundingClientRect();
    const widthMult = (this.width - this.graphPadding) / transform.width;
    const heightMult = (this.height - this.graphPadding) / transform.height;
    return ((widthMult < heightMult) ? widthMult : heightMult);
  }

  /**
   * Center the camera to specified coordinates
   * @param x         The x coordinate
   * @param y         The y coordinate
   * @param k         The zoom level
   * @param duration  The duration the animation should take in milliseconds
   */
  centerCamera(x: number, y: number, k: number, duration = 250): void {
    const computedX = x;
    const computedY = y;
    this.svg.call(this.zoom.scaleTo, k);
    this.svg.transition()
      .duration(duration)
      .call(this.zoom.translateTo, computedX, computedY);
  }

  /**
   * Calculate the distance of two nodes based on their similarity
   * @param link  The link between two notes
   */
  calculateLinkDistance(link: GraphLink): number{
    return queryUtils.calculateCosineDistance(link.value, this.distanceModifier, this.clumpingModifier);
  }

  /**
   * Set the zoom level to a value
   * @param value     Value to set the zoom level to
   * @param duration  The duration of the animation should take in milliseconds
   */
  setZoom(value: number, duration = 250): void{
    // this.zoomed.emit({transform: {k: value}});
    this.svg.transition()
      .duration(duration)
      .call(this.zoom.scaleTo, value);
  }

  /**
   * Pans the graph based on the arrow key input
   * @param keyCode   The keycode of the key pressed
   * @param step      The size of the step to pan by
   * @param duration  The duration of the animation
   */
  keyboardPan(keyCode: string, step = this.defaultPanStep, duration = 125): void{
    const translateByX = keyCode === 'ArrowLeft' ? step : (keyCode === 'ArrowRight' ? -step : 0);
    const translateByY = keyCode === 'ArrowUp' ? step : (keyCode === 'ArrowDown' ? -step : 0);
    this.svg.transition()
      .duration(duration)
      .call(this.zoom.translateBy, translateByX, translateByY);
  }

  /**
   * Zooms the graph based on the inputs from a keyboard
   * @param keyCode   The keycode of the key pressed
   * @param step      The size of the step to zoom by
   * @param duration  The duration of the animation
   */
  keyboardZoom(keyCode: string, step = this.defaultZoomStep, duration = 125): void{
    const zoomStep = keyCode === '+' || keyCode === '=' ? step : (keyCode === '-' ? -step : 0);
    this.svg.transition()
      .duration(duration)
      .call(this.zoom.scaleBy, 1 + zoomStep);
  }

  /**
   * Detects whether changes have happened and updates the DOM
   */
  detectChanges(): void{
    this.changeDetector.detectChanges();
    this.changeDetector.markForCheck();
  }
}
