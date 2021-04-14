import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import {MaterialModule} from '../material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HomeRouter} from './home.routes';
import { GraphComponent } from './graph/graph.component';
import { SidenavComponent } from './sidenav/sidenav.component';

@NgModule({
  declarations: [HomeComponent, GraphComponent, SidenavComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HomeRouter
  ]
})
export class HomeModule { }
