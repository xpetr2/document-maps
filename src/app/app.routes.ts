import {NgModule} from '@angular/core';
import {CanActivate, RouterModule, Routes} from '@angular/router';
import {CorpusLoadedGuard} from './guards/corpus-loaded-guard.service';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./init/init.module').then(m => m.InitModule)
  },
  {
    path: 'map',
    canActivate: ([CorpusLoadedGuard]),
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
