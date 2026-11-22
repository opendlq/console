import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { FunnelRow } from '../domain';

/** Funil de resolução: onde cada mensagem terminou (barra proporcional + legenda com contagem e %). */
@Component({
  selector: 'odlq-funnel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bar" role="img" [attr.aria-label]="label()">
      @for (r of rows(); track r.key) {
        @if (r.count) {
          <span [style.flex-grow]="r.count" [attr.data-tone]="r.tone"></span>
        }
      }
    </div>
    <ul>
      @for (r of rows(); track r.key) {
        <li [attr.data-tone]="r.tone">
          <span class="dot" aria-hidden="true"></span>
          <span class="name">{{ r.label }}<small>{{ r.hint }}</small></span>
          <span class="n">{{ r.count }}</span>
          <span class="pct">{{ percent(r) }}%</span>
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: block;
    }
    [data-tone] {
      --c: var(--ui-text-subtle);
    }
    [data-tone='success'] {
      --c: var(--ui-success-solid);
    }
    [data-tone='info'] {
      --c: var(--ui-info);
    }
    [data-tone='primary'] {
      --c: var(--ui-chart-1);
    }
    [data-tone='warning'] {
      --c: var(--ui-warning);
    }
    [data-tone='danger'] {
      --c: var(--ui-danger);
    }
    .bar {
      display: flex;
      height: 12px;
      gap: 2px;
      overflow: hidden;
      border-radius: var(--ui-radius-pill);
    }
    .bar span {
      flex-basis: 0;
      min-width: 4px;
      background: var(--c);
    }
    ul {
      display: grid;
      gap: 2px;
      margin: 16px 0 0;
      padding: 0;
      list-style: none;
    }
    li {
      display: grid;
      grid-template-columns: 10px 1fr auto 44px;
      align-items: center;
      gap: 12px;
      padding: 6px 0;
      border-bottom: 1px solid var(--ui-border);
      font-size: var(--ui-text-md);
    }
    li:last-child {
      border-bottom: 0;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--c);
    }
    .name small {
      display: block;
      color: var(--ui-text-subtle);
      font-size: var(--ui-text-xs);
    }
    .n {
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
    .pct {
      color: var(--ui-text-muted);
      font: var(--ui-text-sm) var(--ui-font-mono);
      text-align: end;
    }
  `,
})
export class OdlqFunnel {
  readonly rows = input.required<FunnelRow[]>();
  readonly label = input('Resolution funnel');
  private readonly total = computed(() => this.rows().reduce((n, r) => n + r.count, 0) || 1);
  protected percent(r: FunnelRow): number {
    return Math.round((r.count / this.total()) * 100);
  }
}
