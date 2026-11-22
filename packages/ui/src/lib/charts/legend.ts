import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { seriesColor, type OdlqSeries } from './chart-utils';

/** Legenda de séries; com `max`, mostra "+N more" para o excedente. */
@Component({
  selector: 'odlq-chart-legend',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (s of shown(); track s.name) {
      <span class="item"><span class="dot" [style.background]="s.color"></span>{{ s.name }}</span>
    }
    @if (hidden() > 0) {
      <span class="item more">+{{ hidden() }} more</span>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 14px;
      color: var(--ui-text-muted);
      font-size: var(--ui-text-xs);
    }
    .item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 2px;
    }
    .more {
      color: var(--ui-link);
      font-weight: 500;
    }
  `,
})
export class OdlqChartLegend {
  readonly series = input.required<OdlqSeries[]>();
  readonly max = input<number | null>(null);
  protected readonly all = computed(() => this.series().map((s, i) => ({ name: s.name, color: seriesColor(s, i) })));
  protected readonly shown = computed(() => (this.max() === null ? this.all() : this.all().slice(0, this.max()!)));
  protected readonly hidden = computed(() => this.all().length - this.shown().length);
}
