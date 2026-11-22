import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Tecla/atalho: `<kbd odlq-kbd>⌘ + K</kbd>`. */
@Component({
  selector: 'kbd[odlq-kbd]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      height: 18px;
      padding: 0 5px;
      border-radius: var(--ui-radius-sm);
      color: var(--ui-text-subtle);
      font: 500 var(--ui-text-xs) / 1 var(--ui-font-mono);
      letter-spacing: 0.04em;
    }
  `,
})
export class OdlqKbd {}
