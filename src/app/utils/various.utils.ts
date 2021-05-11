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
