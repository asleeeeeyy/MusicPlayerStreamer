// tabs/tabs-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'local',
        loadChildren: () => import('../pages/local/local.module').then(m => m.LocalPageModule)
      },
      {
        path: 'streaming',
        loadChildren: () => import('../pages/streaming/streaming.module').then(m => m.StreamingPageModule)
      },
      {
        path: 'playlists',
        loadChildren: () => import('../pages/playlists/playlists.module').then(m => m.PlaylistsPageModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('../pages/settings/settings.module').then(m => m.SettingsPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/local',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/local',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}