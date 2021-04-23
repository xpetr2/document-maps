import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-comparison-entry',
  templateUrl: './comparison-entry.component.html',
  styleUrls: ['./comparison-entry.component.scss']
})
export class ComparisonEntryComponent implements OnInit {

  @Input() word: string;
  @Input() similarity: number;
  constructor() { }

  ngOnInit(): void {
  }

  getBarWidth(): number{
    return this.similarity * 400;
  }
}
