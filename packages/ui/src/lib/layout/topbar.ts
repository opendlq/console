import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { OdlqIcon } from '../icon/icon';
import { OdlqKbd } from '../kbd/kbd';

/** Barra superior: slots `[start]`, central (busca) e `[end]`. */
@Component({
  selector: 'odlq-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="start"><ng-content select="[start]" /></div>
    <div class="center"><ng-content /></div>
    <div class="end"><ng-content select="[end]" /></div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 16px;
      height: var(--ui-topbar-h);
      padding: 0 20px;
      border-bottom: 1px solid var(--ui-border);
      background: var(--ui-surface);
    }
    .start,
    .end {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .center {
      display: flex;
      flex: 1;
      min-width: 0;
    }
    .end {
      margin-left: auto;
    }
  `,
})
export class OdlqTopbar {}

/** Gatilho da busca global (abre a paleta de comandos). */
@Component({
  selector: 'button[odlq-search-trigger]',
  imports: [OdlqIcon, OdlqKbd],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <odlq-icon name="search" [size]="16" />
    <span class="text">{{ placeholder() }}</span>
    <kbd odlq-kbd>⌘ + K</kbd>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      width: min(320px, 100%);
      height: 36px;
      padding: 0 12px;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-pill);
      background: var(--ui-surface-muted);
      color: var(--ui-text-muted);
      font-size: var(--ui-text-md);
      cursor: pointer;
      transition: border-color var(--ui-transition);
    }
    :host(:hover) {
      border-color: var(--ui-border-strong);
    }
    :host(:focus-visible) {
      outline: none;
      box-shadow: var(--ui-focus-ring);
    }
    .text {
      flex: 1;
      text-align: left;
    }
  `,
})
export class OdlqSearchTrigger {
  readonly placeholder = input('Search…');
}

/** Cluster ativo + estado da conexão ("Confluent pkc-yytws · Connected"). */
@Component({
  selector: 'odlq-cluster-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-state]': 'state()' },
  template: `
    <span class="bar" aria-hidden="true"></span>
    <span class="txt">
      <strong>{{ name() }}</strong>
      <small>{{ statusLabel() }}</small>
    </span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: stretch;
      gap: 8px;
      height: 32px;
    }
    .bar {
      width: 2px;
      border-radius: 2px;
      background: var(--ui-primary);
    }
    .txt {
      display: flex;
      flex-direction: column;
      justify-content: center;
      line-height: 1.2;
    }
    strong {
      font-size: var(--ui-text-sm);
      font-weight: 600;
    }
    small {
      font-size: var(--ui-text-2xs);
      color: var(--ui-success);
    }
    :host([data-state='disconnected']) small {
      color: var(--ui-danger);
    }
    :host([data-state='connecting']) small {
      color: var(--ui-warning);
    }
  `,
})
export class OdlqClusterStatus {
  readonly name = input.required<string>();
  readonly state = input<'connected' | 'connecting' | 'disconnected'>('connected');
  protected statusLabel(): string {
    return { connected: 'Connected', connecting: 'Connecting…', disconnected: 'Disconnected' }[this.state()];
  }
}
