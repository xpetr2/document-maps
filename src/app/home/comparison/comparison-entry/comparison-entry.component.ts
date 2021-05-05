import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {MatCheckboxChange} from '@angular/material/checkbox';

@Component({
  selector: 'app-comparison-entry',
  templateUrl: './comparison-entry.component.html',
  styleUrls: ['./comparison-entry.component.scss']
})
export class ComparisonEntryComponent implements OnInit {

  @Input() word: string;
  @Input() similarity: number;
  @Output() selectedChange = new EventEmitter<{ word: string; checked: boolean }>();
  constructor() { }

  ngOnInit(): void {
  }

  getBarWidth(): number{
    return this.similarity * 400;
  }

  handleChange(event: MatCheckboxChange): void{
    this.selectedChange.emit({ word: this.word, checked: event.checked });
  }
}
