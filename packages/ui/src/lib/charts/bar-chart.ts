import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from '@angular/core';
import { MARGIN, compact, niceScale, seriesColor, useElementWidth, type OdlqSeries } from './chart-utils';

/**
 * Gráfico de barras em SVG: uma série (histograma), várias lado a lado ou empilhadas (`stacked`).
 * Tooltip nativo via `<title>`. ponytail: sem zoom/brush; trocar por ECharts se precisar.
 */
@Component({
  selector: 'odlq-bar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.height.px]': 'height()' },
  template: `
    <svg [attr.width]="width()" [attr.height]="height()" role="img" [attr.aria-label]="label()">
      @for (t of layout().ticks; track t.v) {
        <line class="grid" [attr.x1]="m.l" [attr.x2]="width() - m.r" [attr.y1]="t.y" [attr.y2]="t.y" />
        <text class="tick" text-anchor="end" dy="0.32em" [attr.x]="m.l - 8" [attr.y]="t.y">{{ t.label }}</text>
      }
      @for (b of layout().bars; track $index) {
        <rect class="bar" rx="2" [attr.x]="b.x" [attr.y]="b.y" [attr.width]="b.w" [attr.height]="b.h" [attr.fill]="b.color">
          <title>{{ b.title }}</title>
        </rect>
      }
      @for (x of layout().xLabels; track x.text + x.x) {
        <text class="tick" text-anchor="middle" [attr.x]="x.x" [attr.y]="height() - 6">{{ x.text }}</text>
      }
    </svg>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    svg {
      display: block;
      overflow: visible;
    }
    .grid {
      stroke: var(--ui-chart-grid);
      stroke-dasharray: 2 3;
    }
    .tick {
      fill: var(--ui-text-subtle);
      font: 10px var(--ui-font-mono);
    }
    .bar:hover {
      opacity: 0.8;
    }
  `,
})
export class OdlqBarChart {
  readonly categories = input.required<string[]>();
  readonly series = input.required<OdlqSeries[]>();
  readonly stacked = input(false, { transform: booleanAttribute });
  readonly height = input(200);
  readonly yTicks = input(4);
  readonly yFormat = input<(n: number) => string>(compact);
  readonly label = input('Bar chart');

  protected readonly m = MARGIN;
  protected readonly width = useElementWidth();

  protected readonly layout = computed(() => {
    const w = this.width();
    const h = this.height();
    const cats = this.categories();
    const ss = this.series();
    const pw = Math.max(1, w - MARGIN.l - MARGIN.r);
    const ph = Math.max(1, h - MARGIN.t - MARGIN.b);
    const val = (s: OdlqSeries, i: number) => s.values[i] ?? 0;
    const tops = cats.map((_, i) => (this.stacked() ? ss.reduce((a, s) => a + val(s, i), 0) : Math.max(0, ...ss.map((s) => val(s, i)))));
    const scale = niceScale(Math.max(0, ...tops), this.yTicks());
    const y = (v: number) => MARGIN.t + ph - (v / scale.max) * ph;
    const band = pw / Math.max(1, cats.length);
    const groupW = band * 0.68;
    const barW = this.stacked() ? groupW : groupW / Math.max(1, ss.length);
    const fmt = this.yFormat();

    const bars: { x: number; y: number; w: number; h: number; color: string; title: string }[] = [];
    cats.forEach((cat, i) => {
      const gx = MARGIN.l + i * band + (band - groupW) / 2;
      let acc = 0;
      ss.forEach((s, k) => {
        const v = val(s, i);
        if (v <= 0) return;
        const top = this.stacked() ? y(acc + v) : y(v);
        const bottom = this.stacked() ? y(acc) : y(0);
        bars.push({
          x: this.stacked() ? gx : gx + k * barW,
          y: top,
          w: Math.max(1, barW - (this.stacked() ? 0 : 1)),
          h: Math.max(0, bottom - top - (this.stacked() ? 0.5 : 0)),
          color: seriesColor(s, k),
          title: `${cat} · ${s.name}: ${fmt(v)}`,
        });
        acc += v;
      });
    });

    const every = Math.max(1, Math.ceil(52 / band));
    return {
      ticks: scale.ticks.map((v) => ({ v, y: y(v), label: fmt(v) })),
      bars,
      xLabels: cats.flatMap((text, i) => (i % every === 0 ? [{ text, x: MARGIN.l + i * band + band / 2 }] : [])),
    };
  });
}
