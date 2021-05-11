import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EscapeHtmlPipe } from './escape-html.pipe';
import {PairSplitFirstPipe, PairSplitSecondPipe, PairUpPipe, SplitUpPipe} from './pair-split.pipe';


@NgModule({
  declarations: [
    EscapeHtmlPipe,
    PairSplitFirstPipe,
    PairSplitSecondPipe,
    PairUpPipe,
    SplitUpPipe
  ],
  exports: [
    EscapeHtmlPipe,
    PairSplitFirstPipe,
    PairSplitSecondPipe,
    PairUpPipe,
    SplitUpPipe
  ],
  providers: [
    EscapeHtmlPipe,
    PairSplitFirstPipe,
    PairSplitSecondPipe,
    PairUpPipe,
    SplitUpPipe
  ],
  imports: [
    CommonModule
  ]
})
export class PipesModule { }
