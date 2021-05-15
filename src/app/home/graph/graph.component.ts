import {Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef, AfterViewInit} from '@angular/core';
import * as d3 from 'd3';
import {QueryService} from '../../services/query.service';
import * as queryUtils from '../../utils/query.utils';
import {GraphData, GraphLink, GraphNode} from '../../utils/query.utils';
import {valueChanged} from '../../utils/various.utils';
import {DefaultColors, normalizeDeviation} from '../../utils/graph.utils';

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
   * The currently selected nodes
   */
  @Input() selectedNodes: string[];

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
    // As soon as the component is created, initiate the simulation
    this.initSimulation();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If the "show label" setting is changed, redraw the labels
    if (valueChanged(changes?.showLabels)){
      this.drawLabels();
    }

    // If the "distance modifier" or "clumping modifier" settings is changed
    if (valueChanged(changes?.distanceModifier) || valueChanged(changes?.clumpingModifier)){
      // Recalculate the forces
      this.simulation.force('link')
        .distance(this.calculateLinkDistance.bind(this));
      // Increase the simulation temperature a bit so the nodes can re-settle
      this.simulation.alpha(0.1).restart();
    }

    // If the width or height of the component changes, change the SVG wrapper's view box
    if (valueChanged(changes?.width) || valueChanged(changes?.height) ){
        this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`);
    }
  }

  /**
   * The initialization of the simulation
   */
  initSimulation(): void{
    // Create the simulation
    this.simulation = d3.forceSimulation(this.data.nodes);

    // Initialize the various parts of the simulation
    this.initForces();
    this.initSvg();
    this.initEvents();

    // Draw the nodes on screen
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
    this.simulation
      // Add the node link force between the two nodes
      .force('link', d3.forceLink(this.data.links)
      .id((d: GraphNode) => d.id)
      .distance(this.calculateLinkDistance.bind(this))
      .strength(link => link.value)
      .iterations(10))
      // Add a naturally repulsive force
      .force('charge', d3.forceManyBody()
        .strength(-10))
      // Add a force to prevent overlaps
      .force('collide', d3.forceCollide()
        .strength(1)
        .iterations(10)
        .radius(1))
      // Add a force to gravitate the graph to the center
      .force('center', d3.forceCenter(0, 0)
        .strength(0));
  }

  /**
   * Initialize the main SVG component of the graph
   */
  initSvg(): void{
    // Create a wrapper SVG element
    this.svg = d3.select('figure#graph')
      .append('svg')
      .attr('id', 'svg_wrapper')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`);

    // Add a group, containing the graph
    this.g = this.svg.append('g');
  }

  /**
   * Initialize the behaviours and events of the graph
   */
  initEvents(): void{
    // Create the zoom and pan behaviour
    this.zoom = d3.zoom()
      .on('zoom', (e) => {
        // If zoom changes, we send the value to the parent component
        this.zoomed.emit(e);
        // And we move the actual group, containing the graph
        this.g.attr('transform', e.transform);
      })
      // Add constraints to the zoom
      .scaleExtent([this.minZoom, this.maxZoom]);

    // Add the zoom behaviour to the SVG container
    this.svg.call(this.zoom);

    // Add the keyboard events to the body element
    d3.select('body')
      .on('keydown', (e) => {
        // If the key was an arrow key
        if (e.key.startsWith('Arrow')){
          // We pan using the keyboard
          this.keyboardPan(e.key);
        }
        // If the key was a plus or minus key (equals counts as plus)
        else if (e.key === '+' || e.key === '=' || e.key === '-') {
          // We zoom using the keyboard
          this.keyboardZoom(e.key);
        }
      });

    // If we click on the map itself, not on a node
    this.svg.on('click', (e) => {
      if (e.target.id === this.svg.attr('id')){
        // We emit an event notifying the parent
        this.emptyClicked.emit({click: e, d3});
      }
    });
  }

  /**
   *  Draw the interactive part of the graph
   */
  drawGraph(): void{
    // We draw the nodes and labels
    this.drawNodes();
    this.drawLabels();

    // On every tick of the simulation
    this.simulation.on('tick', () => {
      // We update the positions of the nodes
      this.nodes.attr('transform', d => `translate(${d.x}, ${d.y})`);
      // We emit the alpha event, if possible
      this.updateAlpha(0.001, 0.01);
    });
  }

  /**
   * Emits an event whenever the alpha, the temperature, of the simulation changes by a specific amount
   * @param minimumAlpha  The minimum alpha that the event will emit to
   * @param stepRequired The minimal step required between the last emission
   */
  updateAlpha(minimumAlpha: number, stepRequired: number): void{
    // If the alpha change was significant
    if (this.simulation.alpha() > minimumAlpha && Math.abs(this.previousAlpha - this.simulation.alpha()) > stepRequired ||
      this.simulation.alpha() === 0 && this.previousAlpha !== 0)
    {
      // We redraw the deviations, if there's only one node selected
      if (this.selectedNodes.length === 1){
        this.drawDeviation(this.selectedNodes[0]);
      }
      // We notify the parent using an event
      this.previousAlpha = this.simulation.alpha();
      this.alphaChanged.emit({value: this.simulation.alpha(), d3});
    }
  }

  /**
   * Draw the nodes on the graph and apply interaction events on them
   */
  drawNodes(): void{
    // For every node, create a group wrapper
    this.nodes = this.g.append('g')
      .selectAll('.node-group')
      .data(this.data.nodes)
      .enter().append('g')
      .attr('id', c => `wrapper_${c.id}`)
      .attr('class', 'node-group');

    // Append a circle, portraying the node itself
    this.nodes.append('circle')
      .attr('r', 1)
      .attr('id', c => `node_${c.group}_${c.id}`)
      .attr('z-index', '1')
      // If we click the node, we notify the parent
      .on('click', (e) => {
        this.nodeClicked.emit({click: e, nodes: this.nodes, d3});
      })
      // If we hover over the node, we notify the parent
      .on('mouseenter', (e) => {
        this.hoveredNode = e?.target?.id;
        this.nodeHovered.emit({nodeId: this.hoveredNode, d3});
      })
      // If we stop hovering over the node, we notify the parent
      .on('mouseleave', () => {
        this.hoveredNode = undefined;
        this.nodeHovered.emit({nodeId: this.hoveredNode, d3});
      });
  }

  /**
   * Draws the labels next to the nodes
   */
  drawLabels(): void{
    // If we're meant to be showing labels
    if (this.showLabels) {
      // We append the node labels to the wrappers
      this.nodes.append('text')
        .attr('dx', 1.25)
        .attr('dy', '.35em')
        .attr('font-size', '0.075em')
        .attr('class', 'clickable-through node-label')
        .attr('z-index', '2')
        .text(c => c.id);

      // Raise the labels to top
      this.nodes.select('node-label').raise();
    } else {
      // Remove all the text elements
      this.nodes.selectAll('text').remove();
    }
  }

  /**
   * Calculates the deviation error between two nodes
   * @param sourceNode  The first node
   * @param targetNode  The second node
   * @param sourceID    The id of the first node
   * @param targetID    The id of the second node
   */
  calculateDeviation(sourceNode: any, targetNode: any, sourceID: string, targetID: string): number{
    // Get the X and Y coordinates of the nodes from their transform string using RegEx
    const sPos = (sourceNode.attr('transform') as string).match(/translate\(([^,]+), ([^,)]+)\)/);
    const tPos = (targetNode.attr('transform') as string).match(/translate\(([^,]+), ([^,)]+)\)/);
    // Convert them to floats
    const [sX, sY, tX, tY] = [parseFloat(sPos[1]), parseFloat(sPos[2]), parseFloat(tPos[1]), parseFloat(tPos[2])];

    // Calculate the Euclidean distance from the retrieved coordinates
    const distance = Math.sqrt( (sX - tX) * (sX - tX) + (sY - tY) * (sY - tY) );
    // Get the actual cosine similarity and calculate cosine distance from it
    const weight = this.queryService.getSoftCosineMeasure(sourceID, targetID);
    const supposedDistance =
      queryUtils.calculateCosineDistance(weight, this.distanceModifier, this.clumpingModifier);

    // Normalize the difference from (-inf, inf) to (-1, 1)
    return normalizeDeviation(supposedDistance - distance, 0.1);
  }

  /**
   * Colors all the nodes based on the deviation error calculated between the selected node and that node
   * @param selectedNode  The selected node
   */
  drawDeviation(selectedNode: string): void{
    // Go over all the nodes on the map
    for (const node of this.data.nodes){
      // If the current node is the selected one, skip it
      if (node.id === selectedNode) {
        continue;
      }
      // Retrieve the wrappers of the nodes that store the x and y coordinates
      const targetNode = d3.select(`[id="wrapper_${node.id.replace('.', '\\.')}"]`);
      const sourceNode = d3.select(`[id="wrapper_${selectedNode.replace('.', '\\.')}"]`);

      // Calculate the deviation
      const deviation = this.calculateDeviation(sourceNode, targetNode, selectedNode, node.id);

      // Calculate the color gradient, using the helper color functions
      const incorrectColor = deviation < 0 ? DefaultColors.deviationFar() : DefaultColors.deviationClose();
      const color = DefaultColors.deviationCorrect().colorSrgbGradient(incorrectColor, Math.abs(deviation)).toHex();

      // Color the node based on its deviation from the truth
      targetNode.select('circle').attr('fill', color);
    }
  }

  /**
   * Clears the coloring of all nodes
   */
  clearDeviation(): void{
    d3.selectAll(`[id^="node_2_"]`).attr('fill', null);
    d3.selectAll(`[id^="node_1_"]`).attr('fill', null);
  }

  /**
   * Calculates the required zoom value to contain all the nodes on screen
   */
  calculateCoverZoom(): number {
    // Get the position and size of the graph wrapper
    const transform = this.g.node().getBoundingClientRect();

    // Get the zoom multipliers needed for both width and height
    const widthMult = (this.width - this.graphPadding) / transform.width;
    const heightMult = (this.height - this.graphPadding) / transform.height;

    // Return the smaller, to ensure that no nodes will be out of screen
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
    // Call the zoom in
    this.svg.call(this.zoom.scaleTo, k);
    // Transition to the specified coordinates
    this.svg.transition()
      .duration(duration)
      .call(this.zoom.translateTo, x, y);
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
    // Transition to the specified zoom in level
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
    // Find which key was pressed and store the vector
    const translateByX = keyCode === 'ArrowLeft' ? step : (keyCode === 'ArrowRight' ? -step : 0);
    const translateByY = keyCode === 'ArrowUp' ? step : (keyCode === 'ArrowDown' ? -step : 0);
    // Pan by the specified vector
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
    // Find out, if a zoom in or a zoom out key was pressed
    const zoomStep = keyCode === '+' || keyCode === '=' ? step : (keyCode === '-' ? -step : 0);
    // Zoom in by the step
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
