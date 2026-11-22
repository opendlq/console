import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { OdlqAvatar } from '../avatar/avatar';
import { OdlqIconButton } from '../button/icon-button';
import { OdlqAppShell } from '../layout/app-shell';
import { OdlqBrand } from '../layout/brand';
import { OdlqPageHeader, type OdlqCrumb } from '../layout/page-header';
import { OdlqNavItem, OdlqNavSection, OdlqSidebar } from '../layout/sidebar';
import { OdlqClusterStatus, OdlqSearchTrigger, OdlqTopbar } from '../layout/topbar';
import { OdlqTabs, type OdlqTab } from '../tabs/tabs';

/**
 * Moldura de página usada só nas stories "Páginas/…": sidebar + topbar + cabeçalho já montados.
 * No app real, a mesma composição vive em `apps/console` com `routerLink`.
 */
@Component({
  selector: 'odlq-demo-frame',
  imports: [OdlqAppShell, OdlqSidebar, OdlqNavSection, OdlqNavItem, OdlqBrand, OdlqTopbar, OdlqSearchTrigger, OdlqClusterStatus, OdlqIconButton, OdlqAvatar, OdlqPageHeader, OdlqTabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <odlq-app-shell [height]="height()">
      <odlq-sidebar>
        <odlq-brand brand name="OpenDLQ" [selector]="true" />
        <odlq-nav-section label="Main">
          <a odlq-nav-item icon="home" [active]="active() === 'overview'">Overview</a>
          <a odlq-nav-item icon="bug" [active]="active() === 'failures'">Failures</a>
          <a odlq-nav-item icon="zap" [active]="active() === 'recovery'">Recovery</a>
          <a odlq-nav-item icon="book" [active]="active() === 'runbooks'">Runbooks</a>
        </odlq-nav-section>
        <odlq-nav-section label="Others">
          <a odlq-nav-item icon="insights" [active]="active() === 'insights'">Insights</a>
          <a odlq-nav-item icon="bell" [active]="active() === 'alerts'">Alerts</a>
          <a odlq-nav-item icon="history" [active]="active() === 'audit'">Audit log</a>
          <a odlq-nav-item icon="settings" [active]="active() === 'config'">Configuration</a>
        </odlq-nav-section>
      </odlq-sidebar>
      <odlq-topbar>
        <button start odlq-search-trigger></button>
        <odlq-cluster-status end name="kafka-prod-eu" />
        <button end odlq-icon-button icon="help" label="Help"></button>
        <button end odlq-icon-button icon="bell" label="Notifications"></button>
        <odlq-avatar end name="Alexandro Castro" />
      </odlq-topbar>
      <div class="page">
      <odlq-page-header [title]="title()" [crumbs]="crumbs()">
        <ng-container ngProjectAs="[actions]"><ng-content select="[actions]" /></ng-container>
        @if (tabs().length) {
          <odlq-tabs [tabs]="tabs()" [(selected)]="tab" label="Sections" />
        }
      </odlq-page-header>
      <ng-content />
      </div>
    </odlq-app-shell>
  `,
  styles: `
    :host {
      display: block;
    }
    .page {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
  `,
})
export class OdlqDemoFrame {
  readonly active = input('overview');
  readonly title = input.required<string>();
  readonly crumbs = input<OdlqCrumb[]>([]);
  readonly tabs = input<OdlqTab[]>([]);
  readonly tab = model('');
  readonly height = input('100vh');
}
