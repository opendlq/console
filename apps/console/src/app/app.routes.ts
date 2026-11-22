import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'topics' },
  { path: 'topics', title: 'Topics', loadComponent: () => import('./pages/topics/topics').then((m) => m.TopicsPage) },
  { path: 'topics/:name', title: 'Topic', loadComponent: () => import('./pages/topic/topic').then((m) => m.TopicPage) },
  { path: '**', redirectTo: 'topics' },
];
