import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import {MaterialModule} from '../material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HomeRoutes } from './home.routes';
import { GraphComponent } from './graph/graph.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ComparisonComponent } from './comparison/comparison.component';
import { ComparisonEntryComponent } from './comparison/comparison-entry/comparison-entry.component';
import { SettingsComponent } from './settings/settings.component';
import {AngularResizedEventModule} from 'angular-resize-event';
import { DocumentComponent } from './sidenav/document/document.component';
import { DocumentContentComponent } from './sidenav/document/document-content/document-content.component';
import {PipesModule} from '../pipes/pipes.module';

@NgModule({
  declarations: [
    HomeComponent,
    GraphComponent,
    SidenavComponent,
    ComparisonComponent,
    ComparisonEntryComponent,
    SettingsComponent,
    DocumentComponent,
    DocumentContentComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    AngularResizedEventModule,
    PipesModule,
    HomeRoutes
  ]
})
export class HomeModule { }
