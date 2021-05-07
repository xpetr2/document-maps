import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EscapeHtmlPipe } from './escape-html.pipe';
import {PairSplitFirstPipe, PairSplitSecondPipe} from './pair-split.pipe';


@NgModule({
  declarations: [
    EscapeHtmlPipe,
    PairSplitFirstPipe,
    PairSplitSecondPipe
  ],
  exports: [
    EscapeHtmlPipe,
    PairSplitFirstPipe,
    PairSplitSecondPipe
  ],
  providers: [
    EscapeHtmlPipe,
    PairSplitFirstPipe,
    PairSplitSecondPipe
  ],
  imports: [
    CommonModule
  ]
})
export class PipesModule { }
