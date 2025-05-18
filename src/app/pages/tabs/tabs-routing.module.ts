// pages/tabs/tabs-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'streaming',
        loadChildren: () => import('../streaming/streaming.module').then(m => m.StreamingPageModule)
      },
      {
        path: 'local',
        loadChildren: () => import('../local/local.module').then(m => m.LocalPageModule)
      },
      {
        path: 'playlists',
        loadChildren: () => import('../playlists/playlists.module').then(m => m.PlaylistsPageModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/streaming',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/streaming',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}