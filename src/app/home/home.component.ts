import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {QueryService} from '../services/query.service';
import {MatDrawer} from '@angular/material/sidenav';
import {SelectedDocument, SidenavComponent} from './sidenav/sidenav.component';
import {GraphComponent} from './graph/graph.component';
import {AppSettings} from './settings/settings.component';
import * as queryUtils from '../utils/query.utils';
import {GraphData} from '../utils/query.utils';
import {DefaultColors, log2, normalizeDeviation, pow2} from '../utils/graph.utils';

/**
 * The main home component, responsible for holding the graph, sidenav and comparison components
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements AfterViewInit {

  /**
   * The graph data, retrieved from the WebWorker upon loading
   */
  graphData: GraphData = undefined;

  /**
   * Specifies the minimum zoom possible
   */
  minZoom = 1;
  /**
   * Specifies the maximum zoom possible
   */
  maxZoom = 32;
  /**
   * Specifies the initial zoom
   */
  currentZoom = pow2(2.5);
  /**
   * Specifies the minimum step possible by clicking the zoom buttons
   */
  defaultStepZoom = 0.25;

  /**
   * Holds the ids of selected nodes
   */
  selectedNodes: string[] = [];
  /**
   * Holds the document interfaces of the selected nodes
   */
  selectedDocuments: SelectedDocument[] = [];
  /**
   * Specifies the currently hovered over node
   */
  hoveredNode: string;

  /**
   * The value that the indicator, in the distance error legend, should be offset by in pixels.
   */
  errorIndicatorOffset = 0;

  /**
   * Specifies whether the component is still loading data from the WebWorker
   */
  loading = true;

  /**
   * Determines if the user is currently comparing two documents
   */
  comparingWindowOpen = false;
  /**
   * Determines if the user has settings menu opened
   */
  settingsOpen = false;
  /**
   * The app settings currently in effect
   */
  settings: AppSettings = {
    showLabels: true,
    showDeviations: true,
    distanceModifier: 40,
    clumpingModifier: 5,
  };

  /**
   * The Angular Material sidenav component
   */
  @ViewChild('drawer') matDrawer: MatDrawer;
  /**
   * The application sidenav component, displaying the documents
   */
  @ViewChild('sidenav') sidenav: SidenavComponent;
  /**
   * The graph component, visualizing the nodes.
   */
  @ViewChild('graph') graph: GraphComponent;

  /**
   * @param queryService  The QueryService holding the corpus
   */
  constructor(
    private queryService: QueryService
  ) {}

  ngAfterViewInit(): void{
    // We need to perform this on the next tick, otherwise we trigger the NG0100 error
    setTimeout(() => {
      this.queryService.initGraphData().subscribe(data => {
        this.graphData = data;
        this.loading = false;
      });
    });
  }

  /**
   * Handles the event, raised by the graph component, when the user clicks a node
   * @param e The click event
   */
  handleNodeClick(e: any): void {
    const re = /^node_\d+_(.*)$/;
    const id = (e.click.target) ? re.exec((e.click.target as any).id)[1] : undefined;
    const oldSelection = this.selectedNodes.slice();

    this.matDrawer.open();
    this.comparingWindowOpen = false;

    this.updateSelection(id, e.click.ctrlKey);
    this.redrawSelection(oldSelection, e.d3);
    this.generateSelectedDocuments();
    this.sidenav.clearHighlightedWords();
  }

  /**
   * Handles the event, raised by the graph component, when the user hovers over a node
   * @param e The event, raising the hovered node ID and the D3 object
   */
  handleNodeHovered(e: {nodeId: string, d3: any}): void{
    if (!this.settings.showDeviations || !e.nodeId || !this.selectedNodes || this.selectedNodes?.length !== 1){
      this.errorIndicatorOffset = undefined;
      return;
    }
    const re = /^node_\d+_(.*)$/;
    const id = (e.nodeId) ? re.exec(e.nodeId)[1] : undefined;

    this.calculateErrorIndicatorOffset(id, this.selectedNodes[0], e.d3);
  }

  /**
   * Calculates and stores the indicator offset that should be displayed in the deviation error legend
   * @param id            The ID of the hovered element
   * @param selectedNode  The selected node
   * @param d3            The D3 object
   */
  calculateErrorIndicatorOffset(id: string, selectedNode: string, d3: any): void{
    const targetNode = d3.select(`[id="wrapper_${id.replace('.', '\\.')}"]`);
    const sourceNode = d3.select(`[id="wrapper_${selectedNode.replace('.', '\\.')}"]`);

    const deviation = this.calculateDeviation(sourceNode, targetNode, selectedNode, id);
    this.errorIndicatorOffset = ((deviation + 1) / 2) * 128;
  }

  /**
   * Populates the selectedDocuments array with documents based on the selected nodes
   */
  generateSelectedDocuments(): void{
    this.selectedDocuments = [];
    for (const id of this.selectedNodes){
      const title = `Document ${id}`;
      const subtitle = `${id}`;
      const content = this.queryService.getDocumentText(id);
      this.selectedDocuments.push({id, title, subtitle, content});
    }
  }

  /**
   * Updates the node selection array, either adding or removing a node
   * @param id            The node to be added or removed
   * @param controlHeld   Whether user had held control when click the node
   */
  updateSelection(id: string, controlHeld: boolean): void{
    if (id) {
      if (this.selectedNodes.length === 1 && this.selectedNodes[0] === id){
        this.selectedNodes = [];
      } else if (controlHeld) {
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
  }

  /**
   * Redraws the graph based on the selected nodes
   * @param oldSelection  The previous selection before the change
   * @param d3            The D3 object
   */
  redrawSelection(oldSelection: string[], d3: any): void {
    if (this.settings.showDeviations && this.selectedNodes.length === 1){
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

  /**
   * Clears the selected nodes and closes sidenav completely
   * @param e The event raised
   */
  clearSelection(e: any): void{
    const oldSelection = this.selectedNodes;
    this.selectedNodes = [];
    this.matDrawer.close();
    this.comparingWindowOpen = false;
    this.redrawSelection(oldSelection, e.d3);
    this.generateSelectedDocuments();
    this.sidenav.clearHighlightedWords();
  }

  /**
   * Calculates the deviation error between two nodes
   * @param sourceNode  The first node
   * @param targetNode  The second node
   * @param sourceID    The id of the first node
   * @param targetID    The id of the second node
   */
  calculateDeviation(sourceNode: any, targetNode: any, sourceID: string, targetID: string): number{
    const sPos = (sourceNode.attr('transform') as string).match(/translate\(([^,]+), ([^,)]+)\)/);
    const tPos = (targetNode.attr('transform') as string).match(/translate\(([^,]+), ([^,)]+)\)/);
    const [sX, sY, tX, tY] = [parseFloat(sPos[1]), parseFloat(sPos[2]), parseFloat(tPos[1]), parseFloat(tPos[2])];

    const distance = Math.sqrt( (sX - tX) * (sX - tX) + (sY - tY) * (sY - tY) );
    const weight = this.queryService.getSoftCosineMeasure(sourceID, targetID);
    const supposedDistance =
      queryUtils.calculateCosineDistance(weight, this.settings.distanceModifier, this.settings.clumpingModifier);

    return normalizeDeviation(supposedDistance - distance, 0.1);
  }

  /**
   * Updates all the nodes based on the deviation error calculated between the selected node and that node
   * @param selectedNode  The selected node
   * @param d3            The D3 object
   */
  drawDeviation(selectedNode: string, d3: any): void{
    for (const node of this.graphData.nodes){
      if (node.id === selectedNode) {
        continue;
      }
      const targetNode = d3.select(`[id="wrapper_${node.id.replace('.', '\\.')}"]`);
      const sourceNode = d3.select(`[id="wrapper_${selectedNode.replace('.', '\\.')}"]`);
      const deviation = this.calculateDeviation(sourceNode, targetNode, selectedNode, node.id);
      const incorrectColor = deviation < 0 ? DefaultColors.deviationFar() : DefaultColors.deviationClose();
      const color = DefaultColors.deviationCorrect().colorSrgbGradient(incorrectColor, Math.abs(deviation)).toHex();
      targetNode.select('circle').attr('fill', color);
    }
  }

  /**
   * Clears the coloring of nodes
   * @param d3  The D3 object
   */
  clearDeviation(d3: any): void{
    d3.selectAll(`[id^="node_2_"]`).attr('fill', null);
    d3.selectAll(`[id^="node_1_"]`).attr('fill', null);
  }

  /**
   * Handles when the alpha value, the temperature, of the graph changes
   * @param e An event object, holding the current value of alpha and the D3 object
   */
  handleAlphaChanged(e: {value: number, d3: any}): void{
    if (this.settings.showDeviations && this.selectedNodes.length === 1){
      this.drawDeviation(this.selectedNodes[0], e.d3);
    }
  }

  /**
   * Handles when the user clicks on the comparison button
   */
  handleCompareClick(): void{
    this.comparingWindowOpen = !this.comparingWindowOpen;
  }

  /**
   * Center the camera to the origin, keeping the zoom
   */
  centerCamera(): void{
    this.graph.centerCamera(0, 0, this.currentZoom);
  }

  /**
   * Increases the zoom level by the default step, adjusted logarithmically
   */
  increaseCamera(): void{
    this.changeCameraZoom(log2(this.currentZoom) + this.defaultStepZoom);
  }

  /**
   * Decreases the zoom level by the default step, adjusted logarithmically
   */
  decreaseCamera(): void{
    this.changeCameraZoom(log2(this.currentZoom) - this.defaultStepZoom);
  }

  /**
   * Change the camera zoom to a specified value, adjusted logarithmically
   * @param value   The value the camera should zoom to
   */
  changeCameraZoom(value: number): void{
    value = Math.max(Math.min(pow2(value), this.maxZoom), this.minZoom);
    this.currentZoom = value;
    this.graph.setZoom(value);
  }

  /**
   * Handles the event raised when the user zooms with their mouse on the graph
   * @param e The event raised
   */
  handleZoomed(e: any): void {
    this.currentZoom = e?.transform?.k ?? this.currentZoom;
  }

  /**
   * Handles the event when user closes the sidenav
   */
  handleDrawerClose(): void{
    this.matDrawer.close();
    this.sidenav.clearHighlightedWords();
    this.comparingWindowOpen = false;
  }

  /**
   * Handles the event when user resizes the window
   */
  handleGraphResize(): void{
    this.graph.detectChanges();
  }

  /**
   * Get the minimum zoom allowed, adjusted logarithmically
   */
  getMinZoom(): number {
    return log2(this.minZoom);
  }

  /**
   * Get the maximum zoom allowed, adjusted logarithmically
   */
  getMaxZoom(): number {
    return log2(this.maxZoom);
  }

  /**
   * Get the current zoom, adjusted logarithmically
   */
  getCurrentZoom(): number {
    return log2(this.currentZoom);
  }
}
