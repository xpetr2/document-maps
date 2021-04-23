import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {SearchQuery} from '../../services/query.service';

export interface SelectedDocument{
  id: string;
  title: string;
  subtitle: string;
  content: string;
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  @Input() selectedDocuments: SelectedDocument[] = [];
  @Input() comparingWindowOpen = false;
  @Input() searchQuery: SearchQuery;
  @Output() sidebarClose = new EventEmitter<any>();
  @Output() compareClick = new EventEmitter<any>();

  compareWindow = false;

  constructor() { }

  ngOnInit(): void {
  }

  closeSidenav($event: MouseEvent): void {
    this.sidebarClose.emit($event);
  }

  clickedCompare($event: MouseEvent): void {
    this.compareClick.emit($event);
  }
}
