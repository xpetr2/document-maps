import {NgModule} from '@angular/core';
import {CanActivate, RouterModule, Routes} from '@angular/router';
import {DocumentLoadedGuard} from './guards/document-loaded.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./init/init.module').then(m => m.InitModule)
  },
  {
    path: 'map',
    canActivate: ([DocumentLoadedGuard]),
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
  },
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})

export class AppRouter {}
