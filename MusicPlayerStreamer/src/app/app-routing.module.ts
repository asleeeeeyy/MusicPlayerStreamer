import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
  },
  {
    path: 'local-music',
    loadComponent: () => import('./local-music/local-music.page').then(m => m.LocalMusicPage),
  },
  {
    path: 'now-playing',
    loadComponent: () => import('./now-playing/now-playing.page').then(m => m.NowPlayingPage),
  },
  {
    path: 'playlists',
    loadComponent: () => import('./playlists/playlists.page').then(m => m.PlaylistsPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
