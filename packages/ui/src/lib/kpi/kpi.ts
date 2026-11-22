import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { OdlqBadge } from '../badge/badge';
import type { OdlqTone } from '../types';

/** Cartão de métrica: rótulo mono em caixa alta + valor em destaque. O valor pode ser projetado. */
@Component({
  selector: 'odlq-kpi-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-tone]': 'tone()' },
  template: `
    <span class="label">{{ label() }}</span>
    <span class="value"><ng-content>{{ value() }}</ng-content></span>
    @if (hint()) {
      <span class="hint">{{ hint() }}</span>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
      padding: 12px 16px;
      border-radius: var(--ui-radius-lg);
      background: var(--ui-surface-muted);
    }
    .label {
      color: var(--ui-text-subtle);
      font: 500 var(--ui-text-2xs) / 1 var(--ui-font-mono);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .value {
      color: var(--ui-primary-soft-fg);
      font-size: var(--ui-text-xl);
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
    :host([data-tone='success']) .value {
      color: var(--ui-success);
    }
    :host([data-tone='danger']) .value {
      color: var(--ui-danger);
    }
    :host([data-tone='warning']) .value {
      color: var(--ui-warning);
    }
    :host([data-tone='neutral']) .value {
      color: var(--ui-text);
    }
    .hint {
      color: var(--ui-text-muted);
      font-size: var(--ui-text-xs);
    }
  `,
})
export class OdlqKpiCard {
  readonly label = input.required<string>();
  readonly value = input<string | number>('');
  readonly hint = input('');
  readonly tone = input<OdlqTone>('primary');
}

/** Linha de KPIs que rola na horizontal quando faltar espaço. */
@Component({
  selector: 'odlq-kpi-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: `
    :host {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: minmax(140px, 1fr);
      gap: 12px;
      overflow-x: auto;
    }
  `,
})
export class OdlqKpiRow {}

export interface OdlqStat {
  label: string;
  value: string | number;
  /** Quando definido, o valor vira um badge com esse tom (ex.: Stable). */
  badge?: OdlqTone;
}

/** Barra de métricas em linha, separadas por divisor (STATE · CONSUME RATE · OFFSET LAG…). */
@Component({
  selector: 'odlq-inline-stats',
  imports: [OdlqBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (s of items(); track s.label) {
      <div class="item">
        <span class="label">{{ s.label }}</span>
        @if (s.badge) {
          <odlq-badge [tone]="s.badge" pill>{{ s.value }}</odlq-badge>
        } @else {
          <span class="value">{{ s.value }}</span>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0;
    }
    .item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 16px;
      border-left: 1px solid var(--ui-border);
    }
    .item:first-child {
      padding-left: 0;
      border-left: 0;
    }
    .label {
      color: var(--ui-text-subtle);
      font: 500 var(--ui-text-2xs) / 1 var(--ui-font-mono);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .value {
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class OdlqInlineStats {
  readonly items = input.required<OdlqStat[]>();
}
