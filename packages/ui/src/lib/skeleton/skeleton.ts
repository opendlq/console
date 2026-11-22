import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Placeholder de carregamento. */
@Component({
  selector: 'odlq-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[style.width]': 'width()',
    '[style.height]': 'height()',
    '[style.border-radius]': 'circle() ? "50%" : null',
  },
  template: ``,
  styles: `
    :host {
      display: block;
      border-radius: var(--ui-radius-md);
      background: linear-gradient(90deg, var(--ui-surface-hover) 25%, var(--ui-border) 50%, var(--ui-surface-hover) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s ease-in-out infinite;
    }
    @keyframes shimmer {
      to {
        background-position: -200% 0;
      }
    }
  `,
})
export class OdlqSkeleton {
  readonly width = input('100%');
  readonly height = input('14px');
  readonly circle = input(false);
}
