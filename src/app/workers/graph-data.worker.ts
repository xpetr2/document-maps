/// <reference lib="webworker" />
import * as queryUtils from '../utils/query.utils';
import {flatMap} from 'rxjs/internal/operators';
import {of} from 'rxjs';

/**
 * The WebWorker responsible for doing the heavy lifting of generating nodes and links in the background without blocking the UI.
 * It also sends out the progress state of generating nodes and links
 */
addEventListener('message', ({ data }) => {
  // We start with the createNodes observable
  queryUtils.createNodes(data.query)
    .pipe(
      // We merge in the returned observable inside the flatMap
      flatMap(nodes => {
        // If nodes returned the output data
        if (nodes.data) {
          // We merge in the createLinks observable, passing in the output of the createNodes observable
          return queryUtils.createLinks(nodes.data, data.query)
            .pipe(
              // We merge in the returned observable again from inside this flatMap
              flatMap(links => {
                // If links returned the output data
                if (links.data) {
                  // We return the observable, containing both the data and the progress
                  return of({stage: 'Creating links...', value: links.progress, data: {nodes: nodes.data, links: links.data}});
                } else {
                  // Otherwise we return just an observable of the progress object
                  return of({stage: 'Creating links...', value: links.progress});
                }
              })
            );
        }
        // If nodes returned just the progress, we return an observable of the progress object
        else {
          return of({stage: 'Generating nodes...', value: nodes.progress});
        }
      })
    )
    // Immediately subscribe to this observable and return all the progress and data it emits throughout the calculation
    .subscribe(res => {
      postMessage(res);
  });
});


