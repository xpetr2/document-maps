import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import {MaterialModule} from '../material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HomeRouter} from './home.routes';
import { GraphComponent } from './graph/graph.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ComparisonComponent } from './comparison/comparison.component';
import { ComparisonEntryComponent } from './comparison/comparison-entry/comparison-entry.component';

@NgModule({
  declarations: [HomeComponent, GraphComponent, SidenavComponent, ComparisonComponent, ComparisonEntryComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HomeRouter
  ]
})
export class HomeModule { }
