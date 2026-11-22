import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  OdlqAppShell, OdlqAvatar, OdlqBrand, OdlqClusterStatus, OdlqCommandPalette, OdlqNavItem, OdlqNavSection, OdlqSearchTrigger,
  OdlqSidebar, OdlqToaster, OdlqTopbar, type OdlqCommand,
} from '@opendlq/ui';

const COMMANDS: OdlqCommand[] = [{ id: '/topics', label: 'Go to Dead Letter Topics', group: 'Navigate', icon: 'topics', hint: 'G T' }];

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
          <a odlq-nav-item icon="topics" routerLink="/topics" routerLinkActive #topics="routerLinkActive" [active]="topics.isActive">Topics</a>
        </odlq-nav-section>
      </odlq-sidebar>
      <odlq-topbar>
        <button start odlq-search-trigger (click)="palette.set(true)"></button>
        <odlq-cluster-status end name="local-kafka" />
        <odlq-avatar end name="Admin" />
      </odlq-topbar>
      <router-outlet />
    </odlq-app-shell>
    <odlq-command-palette [(open)]="palette" [commands]="commands" (commandRun)="router.navigateByUrl($event.id)" />
    <odlq-toaster />
  `,
})
export class App {
  protected readonly router = inject(Router);
  protected readonly palette = signal(false);
  protected readonly commands = COMMANDS;

  protected togglePalette(e: Event): void {
    e.preventDefault();
    this.palette.update((v) => !v);
  }
}
