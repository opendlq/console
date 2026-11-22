import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'odlq-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'separator', '[attr.aria-orientation]': 'orientation()', '[attr.data-orientation]': 'orientation()' },
  template: ``,
  styles: `
    :host {
      display: block;
      flex: none;
      background: var(--ui-border);
    }
    :host([data-orientation='horizontal']) {
      height: 1px;
      width: 100%;
    }
    :host([data-orientation='vertical']) {
      width: 1px;
      align-self: stretch;
    }
  `,
})
export class OdlqDivider {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
}
