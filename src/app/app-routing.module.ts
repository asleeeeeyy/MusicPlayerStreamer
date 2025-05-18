import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'now-playing',
    loadChildren: () => import('./pages/now-playing/now-playing.module').then(m => m.NowPlayingPageModule)
  },
  {
  path: 'now-playing',
  loadChildren: () => import('./pages/now-playing/now-playing.module').then(m => m.NowPlayingPageModule)
}

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
