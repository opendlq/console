import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'overview' },
  { path: 'overview', title: 'Overview', loadComponent: () => import('./pages/overview/overview').then((m) => m.OverviewPage) },
  { path: 'failures', title: 'Failures', loadComponent: () => import('./pages/failures/failures').then((m) => m.FailuresPage) },
  { path: 'failures/:key', title: 'Failure', loadComponent: () => import('./pages/failure/failure').then((m) => m.FailurePage) },
  { path: 'recovery', title: 'Recovery', loadComponent: () => import('./pages/recovery/recovery').then((m) => m.RecoveryPage) },
  { path: 'runbooks', title: 'Runbooks', loadComponent: () => import('./pages/runbooks/runbooks').then((m) => m.RunbooksPage) },
  { path: 'audit', title: 'Audit log', loadComponent: () => import('./pages/audit/audit').then((m) => m.AuditPage) },
  { path: '**', redirectTo: 'overview' },
];
