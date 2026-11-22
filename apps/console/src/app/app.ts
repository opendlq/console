import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FailuresStore } from '@opendlq/modules';
import {
  OdlqAppShell, OdlqAvatar, OdlqBrand, OdlqClusterStatus, OdlqCommandPalette, OdlqNavItem, OdlqNavSection, OdlqSearchTrigger,
  OdlqSidebar, OdlqToaster, OdlqTopbar, type OdlqCommand,
} from '@opendlq/ui';

const PAGES: OdlqCommand[] = [
  { id: '/overview', label: 'Go to Overview', group: 'Navigate', icon: 'home', hint: 'G O' },
  { id: '/failures', label: 'Go to Failures', group: 'Navigate', icon: 'bug', hint: 'G F' },
  { id: '/recovery', label: 'Go to Recovery', group: 'Navigate', icon: 'zap', hint: 'G R' },
  { id: '/runbooks', label: 'Go to Runbooks', group: 'Navigate', icon: 'book', hint: 'G B' },
  { id: '/audit', label: 'Go to Audit log', group: 'Navigate', icon: 'history', hint: 'G A' },
];

@Component({
  selector: 'odlq-root',
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive, OdlqAppShell, OdlqSidebar, OdlqNavSection, OdlqNavItem, OdlqBrand, OdlqTopbar,
    OdlqSearchTrigger, OdlqClusterStatus, OdlqAvatar, OdlqCommandPalette, OdlqToaster,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.meta.k)': 'togglePalette($event)', '(document:keydown.control.k)': 'togglePalette($event)' },
  template: `
    <odlq-app-shell>
      <odlq-sidebar>
        <odlq-brand brand name="OpenDLQ" />
        <odlq-nav-section label="Main">
          <a odlq-nav-item icon="home" routerLink="/overview" routerLinkActive #overview="routerLinkActive" [active]="overview.isActive">Overview</a>
          <a odlq-nav-item icon="bug" routerLink="/failures" routerLinkActive #failures="routerLinkActive" [active]="failures.isActive" [count]="failuresStore.open().length">Failures</a>
          <a odlq-nav-item icon="zap" routerLink="/recovery" routerLinkActive #recovery="routerLinkActive" [active]="recovery.isActive">Recovery</a>
          <a odlq-nav-item icon="book" routerLink="/runbooks" routerLinkActive #runbooks="routerLinkActive" [active]="runbooks.isActive">Runbooks</a>
        </odlq-nav-section>
        <odlq-nav-section label="Others">
          <a odlq-nav-item icon="history" routerLink="/audit" routerLinkActive #audit="routerLinkActive" [active]="audit.isActive">Audit log</a>
        </odlq-nav-section>
      </odlq-sidebar>
      <odlq-topbar>
        <button start odlq-search-trigger (click)="palette.set(true)"></button>
        <odlq-cluster-status end name="local-kafka" />
        <odlq-avatar end name="Admin" />
      </odlq-topbar>
      <router-outlet />
    </odlq-app-shell>
    <odlq-command-palette [(open)]="palette" [commands]="commands()" (commandRun)="router.navigateByUrl($event.id)" />
    <odlq-toaster />
  `,
})
export class App {
  protected readonly router = inject(Router);
  protected readonly failuresStore = inject(FailuresStore);
  protected readonly palette = signal(false);
  /** Páginas + cada causa aberta (⌘K para ir direto a ela). */
  protected readonly commands = computed<OdlqCommand[]>(() => [
    ...PAGES,
    ...this.failuresStore.groups().map((g) => ({ id: `/failures/${g.key}`, label: g.reason, group: 'Causes', icon: 'bug' as const, hint: g.consumer })),
  ]);

  protected togglePalette(e: Event): void {
    e.preventDefault();
    this.palette.update((v) => !v);
  }
}
