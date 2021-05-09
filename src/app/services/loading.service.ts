import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private isLoadingSource = new BehaviorSubject<boolean>(false);
  isLoading = this.isLoadingSource.asObservable();

  private loadingProgressSource = new BehaviorSubject<number>(0);
  loadingProgress = this.loadingProgressSource.asObservable();

  private loadingStageSource = new BehaviorSubject<string>('');
  loadingStage = this.loadingStageSource.asObservable();

  constructor() { }

  setIsLoading(value: boolean): void{
    this.isLoadingSource.next(value);
  }

  setLoadingProgress(value: number): void{
    this.loadingProgressSource.next(value);
  }

  setLoadingStage(value: string): void{
    this.loadingStageSource.next(value);
  }
}
