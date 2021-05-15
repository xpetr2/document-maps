import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {QueryService} from '../services/query.service';
import {MatDrawer} from '@angular/material/sidenav';
import {SelectedDocument, SidenavComponent} from './sidenav/sidenav.component';
import {GraphComponent} from './graph/graph.component';
import {AppSettings} from './user-interface/settings/settings.component';
import * as queryUtils from '../utils/query.utils';
import {GraphData} from '../utils/query.utils';
import {DefaultColors, log2, normalizeDeviation, pow2} from '../utils/graph.utils';
import {getNodeDocumentId} from '../utils/various.utils';

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
  readonly minZoom = 1;
  /**
   * Specifies the maximum zoom possible
   */
  readonly maxZoom = 32;
  /**
   * Specifies the initial zoom
   */
  currentZoom = pow2(2.5);
  /**
   * Specifies the minimum step possible by clicking the zoom buttons
   */
  readonly defaultStepZoom = 0.25;

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
   * Determines if the user is currently comparing two documents
   */
  comparingWindowOpen = false;
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
    // We need to perform this on the next tick of rendering, since the subject observable emits immediately,
    // otherwise we might trigger the NG0100 error
    setTimeout(() => {
      // As soon as possible, load the graph data and then store them
      this.queryService.initGraphData().subscribe(data => {
        this.graphData = data;
      });
    });
  }

  /**
   * Handles the event, raised by the graph component, when the user clicks a node
   * @param e The click event
   */
  handleNodeClick(e: any): void {
    // Retrieve the document ID of the clicked node
    const id = getNodeDocumentId(e.click.target?.id);
    // Create a copy of the selectedNodes array
    const oldSelection = this.selectedNodes.slice();

    // Open the sidebar and close the comparison window, if they haven't done already
    this.matDrawer.open();
    this.comparingWindowOpen = false;

    // Handle the selection list change and redraw nodes
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
    // If we're not supposed to be showing deviation data, don't bother with the function
    if (!this.settings.showDeviations || !e.nodeId || !this.selectedNodes || this.selectedNodes?.length !== 1){
      this.errorIndicatorOffset = undefined;
      return;
    }
    // Get the document ID
    const id = getNodeDocumentId(e.nodeId);

    this.calculateErrorIndicatorOffset(id, this.selectedNodes[0], e.d3);
  }

  /**
   * Calculates and stores the indicator offset that should be displayed in the deviation error legend
   * @param id            The ID of the hovered element
   * @param selectedNode  The selected node
   * @param d3            The D3 object
   */
  calculateErrorIndicatorOffset(id: string, selectedNode: string, d3: any): void{
    // Get the wrappers of the nodes, which hold the x and y positions
    // Since we cannot have dots in the JavaScript ids, but they might be in the node IDs, we have to escape them
    const targetNode = d3.select(`[id="wrapper_${id.replace('.', '\\.')}"]`);
    const sourceNode = d3.select(`[id="wrapper_${selectedNode.replace('.', '\\.')}"]`);

    // Calculate the deviation and store it
    const deviation = this.calculateDeviation(sourceNode, targetNode, selectedNode, id);
    // We add one and divide by two to move the range from [-1, 1] to [0, 1] and multiply by the height of the indicator
    this.errorIndicatorOffset = ((deviation + 1) / 2) * 128;
  }

  /**
   * Populates the selectedDocuments array with documents based on the selected nodes
   */
  generateSelectedDocuments(): void{
    // Clear the selectedDocuments array
    this.selectedDocuments = [];
    // For every node that is selected, create a new SelectedDocument object and store it
    for (const id of this.selectedNodes){
      const title = `Document ${id}`;
      const subtitle = `${id}`;
      // Get the actual text of the document from the corpus
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
    // If the id actually exists
    if (id) {
      // If we only have one node selected, and its the one clicked, we clear
      if (this.selectedNodes.length === 1 && this.selectedNodes[0] === id){
        this.selectedNodes = [];
      }
      // If the user held control
      else if (controlHeld) {
        // We see if the node is already selected
        const nodeInArray = this.selectedNodes.indexOf(id);
        if (nodeInArray >= 0){
          // We remove only the node if it was already selected
          this.selectedNodes.splice(nodeInArray, 1);
        } else {
          // We add the node if it wasn't selected
          this.selectedNodes.push(id);
        }
      }
      // If control wasn't held and the node is not selected, drop all selected nodes and select just the clicked node
      else {
        this.selectedNodes = [id];
      }
    }
    // If now no nodes are selected, close the sidebar
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
    // If we're supposed to be showing deviations, draw them, otherwise clear them, just in case
    if (this.settings.showDeviations && this.selectedNodes.length === 1){
      this.drawDeviation(this.selectedNodes[0], d3);
    } else {
      this.clearDeviation(d3);
    }
    // Go through the previously selected nodes and remove their selected class
    for (const id of oldSelection){
      d3.select(`[id^="node_"][id$="${id.replace('.', '\\.')}"]`).attr('class', '');
    }
    // Add the selected class to all the newly selected nodes
    for (const id of this.selectedNodes){
      d3.select(`[id^="node_"][id$="${id.replace('.', '\\.')}"]`).attr('class', 'selected');
    }
  }

  /**
   * Clears the selected nodes and closes sidenav completely
   * @param e The event raised
   */
  clearSelection(e: any): void{
    // Temporarily store the previously selected nodes
    const oldSelection = this.selectedNodes;
    // Deselect all nodes
    this.selectedNodes = [];
    // Close the sidebar completely
    this.matDrawer.close();
    this.comparingWindowOpen = false;
    // Redraw the nodes and selected documents
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
      queryUtils.calculateCosineDistance(weight, this.settings.distanceModifier, this.settings.clumpingModifier);

    // Normalize the difference from (-inf, inf) to (-1, 1)
    return normalizeDeviation(supposedDistance - distance, 0.1);
  }

  /**
   * Colors all the nodes based on the deviation error calculated between the selected node and that node
   * @param selectedNode  The selected node
   * @param d3            The D3 object
   */
  drawDeviation(selectedNode: string, d3: any): void{
    // Go over all the nodes on the map
    for (const node of this.graphData.nodes){
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
    // If we're supposed to be showing deviations
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
  handleCenterCamera(): void{
    this.graph.centerCamera(0, 0, this.currentZoom);
  }

  /**
   * Increases the zoom level by the default step, adjusted logarithmically
   */
  handleIncreaseCamera(): void{
    this.changeCameraZoom(log2(this.currentZoom) + this.defaultStepZoom);
  }

  /**
   * Decreases the zoom level by the default step, adjusted logarithmically
   */
  handleDecreaseCamera(): void{
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
