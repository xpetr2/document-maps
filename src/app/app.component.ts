import {Component, OnInit} from '@angular/core';
import {LoadingService} from './services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'Document Maps';

  isLoading = false;
  loadingProgress: number;
  loadingStage: string;

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
