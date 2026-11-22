import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { OdlqTone } from '../types';

/** Barra de progresso/medidor (health score, distribuição). */
@Component({
  selector: 'odlq-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'progressbar',
    '[attr.aria-valuenow]': 'value()',
    '[attr.aria-valuemin]': '0',
    '[attr.aria-valuemax]': 'max()',
    '[attr.aria-label]': 'label() || null',
    '[attr.data-tone]': 'tone()',
  },
  template: `<span class="fill" [style.width.%]="pct()"></span>`,
  styles: `
    :host {
      display: block;
      height: 6px;
      overflow: hidden;
      border-radius: var(--ui-radius-pill);
      background: var(--ui-surface-hover);
    }
    .fill {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: var(--ui-primary);
      transition: width 240ms ease;
    }
    :host([data-tone='success']) .fill {
      background: var(--ui-success-solid);
    }
    :host([data-tone='warning']) .fill {
      background: var(--ui-warning);
    }
    :host([data-tone='danger']) .fill {
      background: var(--ui-danger);
    }
  `,
})
export class OdlqProgress {
  readonly value = input.required<number>();
  readonly max = input(100);
  readonly tone = input<OdlqTone>('primary');
  readonly label = input('');
  protected readonly pct = computed(() => Math.max(0, Math.min(100, (this.value() / this.max()) * 100)));
}
