import { Injectable } from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import { Observable } from 'rxjs';
import {QueryService} from '../services/query.service';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DocumentLoadedGuard implements CanActivate {
  constructor(
    private queryService: QueryService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.queryService.currentQuery
      .pipe(map((query) => {
        if (query !== undefined){
          return true;
        }
        this.router.navigate(['']);
        return false;
      }));
  }
}
