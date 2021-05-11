import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

/**
 * The service, responsible for passing the progress of long function to other components
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  /**
   * The subject which stores the value, if something is currently loading
   * @private
   */
  private isLoadingSource = new BehaviorSubject<boolean>(false);
  /**
   * The observable generated from isLoadingSource
   */
  isLoading = this.isLoadingSource.asObservable();

  /**
   * The subject which stores the value of the current progress percentage
   * @private
   */
  private loadingProgressSource = new BehaviorSubject<number>(0);
  /**
   * The observable generated from loadingProgressSource
   */
  loadingProgress = this.loadingProgressSource.asObservable();

  /**
   * The subject which stores the value of the current loading stage
   * @private
   */
  private loadingStageSource = new BehaviorSubject<string>('');
  /**
   * The observable generated from loadingStageSource
   */
  loadingStage = this.loadingStageSource.asObservable();

  /**
   * A setter for the isLoading value
   * @param value The value to be set
   */
  setIsLoading(value: boolean): void{
    this.isLoadingSource.next(value);
  }

  /**
   * A setter for the loadingProgress value
   * @param value The value to be set
   */
  setLoadingProgress(value: number): void{
    this.loadingProgressSource.next(value);
  }

  /**
   * A setter for the loadingStage value
   * @param value The value to be set
   */
  setLoadingStage(value: string): void{
    this.loadingStageSource.next(value);
  }
}
