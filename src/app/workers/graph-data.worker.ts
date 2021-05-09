/// <reference lib="webworker" />
import * as queryUtils from '../utils/query.utils';
import {GraphData} from '../utils/query.utils';
import {flatMap} from 'rxjs/internal/operators';
import {of} from 'rxjs';

export interface ProgressReport{
  stage: string;
  value: number;
  data?: GraphData;
}

addEventListener('message', ({ data }) => {
  /*const nodes = queryUtils.createNodes(data.query);
  const links = queryUtils.createLinks(nodes, data.query);
  postMessage({nodes, links});*/
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


