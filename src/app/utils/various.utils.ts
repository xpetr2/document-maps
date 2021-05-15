/**
 * The default pair separator, used for simulating string tuples within the app.
 * Needs to be placed in a utility file because of the WebWorker
 */
export const pairSeparator = '\0';

/**
 * A helper function that determines if the value has changed from a SimpleChange object
 * @param changesValue  The value to check for changes
 */
export function valueChanged(changesValue: any): boolean{
  return changesValue?.previousValue !== undefined && changesValue?.currentValue !== changesValue?.previousValue;
}

/**
 * A quick regex way of retrieving the document ID from the node ID
 * @param nodeId  The node ID we'd like to get the document ID from
 */
export function getNodeDocumentId(nodeId: string): string{
  const re = /^node_\d+_(.*)$/;
  return (nodeId) ? re.exec(nodeId)[1] : undefined;
}
