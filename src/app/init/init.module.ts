import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InitComponent } from './init.component';
import {InitRoutes} from './init.routes';
import {MaterialModule} from '../material.module';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    InitComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    InitRoutes,
    FormsModule,
  ]
})
export class InitModule { }
