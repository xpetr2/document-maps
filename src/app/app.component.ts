import {Component, OnInit} from '@angular/core';
import {LoadingService} from './services/loading.service';


/**
 * Main wrapper component of the application, handles only the loading between routes
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'Document Maps';

  /**
   * Specifies if the page is loading
   * @public
   */
  isLoading = false;
  /**
   * Specifies the progress in percentage value of the current stage
   * @public
   */
  loadingProgress: number;
  /**
   * Specifies the current loading stage of the entire loading process
   * @public
   */
  loadingStage: string;

  /**
   * @param loadingService - The loading service, passing values of loading
   */
  constructor(
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadingService.loadingProgress.subscribe(value => {
      if (this.loadingProgress !== value){
        this.loadingProgress = value;
      }
    });
    this.loadingService.loadingStage.subscribe(value => {
      if (this.loadingStage !== value) {
        this.loadingStage = value;
      }
    });
    this.loadingService.isLoading.subscribe(value => {
      if (this.isLoading !== value) {
        this.isLoading = value;
      }
    });
  }
}
