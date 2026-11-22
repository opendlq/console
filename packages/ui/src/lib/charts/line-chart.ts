import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, signal } from '@angular/core';
import { MARGIN, compact, niceScale, seriesColor, useElementWidth, type OdlqSeries } from './chart-utils';

/**
 * Gráfico de linhas (séries temporais) com área opcional e crosshair no hover.
 * Os pontos são espaçados uniformemente; `categories` são rótulos do eixo X, também uniformes.
 */
@Component({
  selector: 'odlq-line-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.height.px]': 'height()' },
  template: `
    <svg
      [attr.width]="width()"
      [attr.height]="height()"
      role="img"
      [attr.aria-label]="label()"
      (pointermove)="onMove($event)"
      (pointerleave)="hover.set(null)"
    >
      @for (t of layout().ticks; track t.v) {
        <line class="grid" [attr.x1]="left()" [attr.x2]="width() - m.r" [attr.y1]="t.y" [attr.y2]="t.y" />
        <text class="tick" text-anchor="end" dy="0.32em" [attr.x]="left() - 8" [attr.y]="t.y">{{ t.label }}{{ unit() ? ' ' + unit() : '' }}</text>
      }
      @for (l of layout().lines; track l.name) {
        @if (area()) {
          <path class="area" [attr.d]="l.area" [attr.fill]="l.color" />
        }
        <path class="line" [attr.d]="l.d" [attr.stroke]="l.color" />
      }
      @for (x of layout().xLabels; track x.text + x.x) {
        <text class="tick" text-anchor="middle" [attr.x]="x.x" [attr.y]="height() - 6">{{ x.text }}</text>
      }
      @if (hoverInfo(); as hv) {
        <line class="cross" [attr.x1]="hv.x" [attr.x2]="hv.x" [attr.y1]="m.t" [attr.y2]="height() - m.b" />
        @for (p of hv.points; track p.name) {
          <circle r="3.5" [attr.cx]="hv.x" [attr.cy]="p.y" [attr.fill]="p.color" class="dot" />
        }
        <g [attr.transform]="'translate(' + hv.boxX + ',' + m.t + ')'">
          <rect class="tip" rx="6" width="132" [attr.height]="14 + hv.points.length * 16" />
          @for (p of hv.points; track p.name; let i = $index) {
            <circle r="3" cx="10" [attr.cy]="16 + i * 16" [attr.fill]="p.color" />
            <text class="tiptext" x="18" [attr.y]="19 + i * 16">{{ p.name }}: {{ p.text }}</text>
          }
        </g>
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
    .line {
      fill: none;
      stroke-width: 1.6;
      stroke-linejoin: round;
    }
    .area {
      opacity: 0.12;
    }
    .cross {
      stroke: var(--ui-border-strong);
    }
    .dot {
      stroke: var(--ui-surface);
      stroke-width: 1.5;
    }
    .tip {
      fill: var(--ui-surface);
      stroke: var(--ui-border-strong);
    }
    .tiptext {
      fill: var(--ui-text);
      font: 10px var(--ui-font-mono);
    }
  `,
})
export class OdlqLineChart {
  readonly series = input.required<OdlqSeries[]>();
  readonly categories = input<string[]>([]);
  readonly height = input(180);
  readonly yTicks = input(3);
  readonly unit = input('');
  readonly area = input(false, { transform: booleanAttribute });
  readonly yFormat = input<(n: number) => string>(compact);
  readonly label = input('Line chart');

  protected readonly m = MARGIN;
  /** Margem esquerda: maior quando os ticks do eixo Y levam unidade. */
  protected readonly left = computed(() => (this.unit() ? 76 : MARGIN.l));
  protected readonly width = useElementWidth();
  protected readonly hover = signal<number | null>(null);

  private readonly count = computed(() => Math.max(2, ...this.series().map((s) => s.values.length)));

  protected readonly layout = computed(() => {
    const w = this.width();
    const h = this.height();
    const pw = Math.max(1, w - this.left() - MARGIN.r);
    const ph = Math.max(1, h - MARGIN.t - MARGIN.b);
    const n = this.count();
    const all = this.series().flatMap((s) => s.values.filter((v): v is number => v !== null));
    const scale = niceScale(Math.max(0, ...all), this.yTicks());
    const x = (i: number) => this.left() + (i / (n - 1)) * pw;
    const y = (v: number) => MARGIN.t + ph - (v / scale.max) * ph;
    const baseline = y(0);
    const fmt = this.yFormat();

    const lines = this.series().map((s, k) => {
      const pts = s.values.flatMap((v, i) => (v === null ? [] : [[x(i), y(v)] as const]));
      const d = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
      const area = pts.length ? `${d} L${pts[pts.length - 1][0].toFixed(1)},${baseline} L${pts[0][0].toFixed(1)},${baseline} Z` : '';
      return { name: s.name, d, area, color: seriesColor(s, k) };
    });

    const cats = this.categories();
    const every = Math.max(1, Math.ceil(cats.length / Math.max(1, Math.floor(pw / 56))));
    return {
      ticks: scale.ticks.map((v) => ({ v, y: y(v), label: fmt(v) })),
      lines,
      xLabels: cats.flatMap((text, i) => (i % every === 0 ? [{ text, x: this.left() + (cats.length > 1 ? (i / (cats.length - 1)) * pw : 0) }] : [])),
    };
  });

  protected readonly hoverInfo = computed(() => {
    const i = this.hover();
    if (i === null) return null;
    const w = this.width();
    const pw = w - this.left() - MARGIN.r;
    const ph = this.height() - MARGIN.t - MARGIN.b;
    const all = this.series().flatMap((s) => s.values.filter((v): v is number => v !== null));
    const max = niceScale(Math.max(0, ...all), this.yTicks()).max;
    const x = this.left() + (i / (this.count() - 1)) * pw;
    const points = this.series().flatMap((s, k) => {
      const v = s.values[i];
      return v === null || v === undefined
        ? []
        : [{ name: s.name, color: seriesColor(s, k), y: MARGIN.t + ph - (v / max) * ph, text: this.yFormat()(v) }];
    });
    return { x, points, boxX: x + 140 > w ? x - 140 : x + 8 };
  });

  protected onMove(e: PointerEvent): void {
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    const pw = this.width() - this.left() - MARGIN.r;
    const ratio = (e.clientX - rect.left - this.left()) / pw;
    this.hover.set(ratio < 0 || ratio > 1 ? null : Math.round(ratio * (this.count() - 1)));
  }
}
