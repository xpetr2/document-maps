import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EscapeHtmlPipe } from './escapeHtml.pipe';


@NgModule({
  declarations: [
    EscapeHtmlPipe
  ],
  exports: [
    EscapeHtmlPipe
  ],
  providers: [
    EscapeHtmlPipe
  ],
  imports: [
    CommonModule
  ]
})
export class PipesModule { }
