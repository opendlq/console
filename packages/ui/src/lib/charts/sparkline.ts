import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Minigráfico de tendência (sem eixos), para células de tabela e cartões. */
@Component({
  selector: 'odlq-sparkline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="width()" [attr.height]="height()" [attr.viewBox]="'0 0 ' + width() + ' ' + height()" role="img" [attr.aria-label]="label()">
      <polyline [attr.points]="points()" fill="none" [attr.stroke]="color()" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
  `,
})
export class OdlqSparkline {
  readonly values = input.required<number[]>();
  readonly width = input(88);
  readonly height = input(22);
  readonly color = input('var(--ui-chart-1)');
  readonly label = input('Trend');

  protected readonly points = computed(() => {
    const v = this.values();
    const max = Math.max(...v, 1);
    const [w, h] = [this.width(), this.height()];
    return v.map((n, i) => `${v.length > 1 ? (i * w) / (v.length - 1) : 0},${h - 2 - (n / max) * (h - 4)}`).join(' ');
  });
}
