/// <reference lib="webworker" />
import * as queryUtils from '../utils/query.utils';
import {flatMap} from 'rxjs/internal/operators';
import {of} from 'rxjs';

/**
 * The WebWorker responsible for doing the heavy lifting of generating nodes and links in the background without blocking the UI.
 * It also sends out the progress state of generating nodes and links
 */
addEventListener('message', ({ data }) => {
  queryUtils.createNodes(data.query)
    .pipe(
      flatMap(nodes => {
        if (nodes.data) {
          return queryUtils.createLinks(nodes.data, data.query)
            .pipe(
              flatMap(links => {
                if (links.data) {
                  return of({stage: 'Creating links...', value: links.progress, data: {nodes: nodes.data, links: links.data}});
                } else {
                  return of({stage: 'Creating links...', value: links.progress});
                }
              })
            );
        } else {
          return of({stage: 'Generating nodes...', value: nodes.progress});
        }
      })
    ).subscribe(res => {
      postMessage(res);
  });
});


