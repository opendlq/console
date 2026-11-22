import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { OdlqBadge } from '../badge/badge';
import { OdlqProgress } from '../progress/progress';
import type { OdlqTone } from '../types';

export interface OdlqRiskItem {
  name: string;
  value: string | number;
}

/** Card de insight: métrica principal, barra de proporção e top-N ofensores como pills. */
@Component({
  selector: 'odlq-risk-card',
  imports: [OdlqBadge, OdlqProgress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="head">
      <h2>{{ heading() }}</h2>
      @if (badge()) {
        <odlq-badge [tone]="tone()">{{ badge() }}</odlq-badge>
      }
    </div>
    <div class="metric">
      <strong>{{ metric() }}</strong>
      <span>{{ hint() }}</span>
    </div>
    <odlq-progress [value]="percent()" [tone]="tone()" [label]="heading() + ' ' + percent() + '%'" />
    @if (items().length) {
      <div class="top">
        <span class="lbl">Top {{ items().length }}</span>
        <ul>
          @for (i of items(); track i.name) {
            <li><span class="name">{{ i.name }}</span><span class="val">{{ i.value }}</span></li>
          }
        </ul>
      </div>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-lg);
      background: var(--ui-surface);
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    h2 {
      margin: 0;
      color: var(--ui-text-subtle);
      font: 500 var(--ui-text-2xs) / 1 var(--ui-font-mono);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .metric {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    strong {
      font-size: 28px;
      font-weight: 600;
      line-height: 1;
    }
    .metric span {
      color: var(--ui-text-muted);
      font-size: var(--ui-text-sm);
    }
    .lbl {
      color: var(--ui-text-subtle);
      font-size: var(--ui-text-xs);
    }
    ul {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 6px 0 0;
      padding: 0;
      list-style: none;
    }
    li {
      display: inline-flex;
      gap: 6px;
      padding: 3px 8px;
      border: 1px solid var(--ui-border);
      border-radius: 999px;
      background: var(--ui-surface-muted);
      font-size: var(--ui-text-xs);
    }
    .val {
      color: var(--ui-text-muted);
      font-family: var(--ui-font-mono);
    }
  `,
})
export class OdlqRiskCard {
  readonly heading = input.required<string>();
  readonly metric = input.required<string | number>();
  readonly hint = input('');
  /** 0–100 */
  readonly percent = input(0);
  readonly badge = input('');
  readonly items = input<OdlqRiskItem[]>([]);
  protected readonly tone = computed<OdlqTone>(() => (this.percent() >= 75 ? 'danger' : this.percent() >= 40 ? 'warning' : 'success'));
}
