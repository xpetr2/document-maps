import { Injectable } from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import { Observable } from 'rxjs';
import {QueryService} from '../services/query.service';
import {map} from 'rxjs/operators';

/**
 * Prevents a route from happening unless a corpus is loaded within the QueryService
 */
@Injectable({
  providedIn: 'root'
})
export class DocumentLoadedGuard implements CanActivate {
  /**
   * @param queryService  The query service where the corpus is located
   * @param router        The router used for navigating to homepage if document is not loaded
   */
  constructor(
    private queryService: QueryService,
    private router: Router
  ) {}

  /**
   * Returns an observable that returns a boolean whether a corpus is present in the QueryService
   */
  canActivate(): Observable<boolean> {
    return this.queryService.currentCorpus
      .pipe(map((corpus) => {
        if (corpus !== undefined){
          return true;
        }
        this.router.navigate(['']);
        return false;
      }));
  }
}
