import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'odlq-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'status', '[attr.aria-label]': 'label()', '[style.width.px]': 'size()', '[style.height.px]': 'size()' },
  template: ``,
  styles: `
    :host {
      display: inline-block;
      border: 2px solid var(--ui-border-strong);
      border-top-color: var(--ui-primary);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class OdlqSpinner {
  readonly size = input(18);
  readonly label = input('Loading');
}
