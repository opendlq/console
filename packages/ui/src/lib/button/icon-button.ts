import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { OdlqIcon } from '../icon/icon';
import type { OdlqIconName } from '../icon/icons';
import type { OdlqSize } from '../types';

export type OdlqIconButtonVariant = 'ghost' | 'outline' | 'primary' | 'secondary' | 'danger-soft';

/** Botão só com ícone. `label` é obrigatório (vira `aria-label`). */
@Component({
  selector: 'button[odlq-icon-button], a[odlq-icon-button]',
  imports: [OdlqIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.aria-label]': 'label()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-round]': 'round() || null',
  },
  template: `<odlq-icon [name]="icon()" [size]="size() === 'sm' ? 14 : 16" />`,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--ui-control-h-md);
      height: var(--ui-control-h-md);
      padding: 0;
      border: 1px solid transparent;
      border-radius: var(--ui-radius-md);
      background: transparent;
      color: var(--ui-text-muted);
      cursor: pointer;
      transition:
        background var(--ui-transition),
        color var(--ui-transition);
    }
    :host([data-size='sm']) {
      width: var(--ui-control-h-sm);
      height: var(--ui-control-h-sm);
    }
    :host([data-size='lg']) {
      width: var(--ui-control-h-lg);
      height: var(--ui-control-h-lg);
    }
    :host([data-round]) {
      border-radius: var(--ui-radius-pill);
    }
    :host(:hover) {
      background: var(--ui-surface-hover);
      color: var(--ui-text);
    }
    :host([data-variant='outline']) {
      border-color: var(--ui-border-strong);
      background: var(--ui-surface);
    }
    :host([data-variant='secondary']) {
      background: var(--ui-surface-hover);
    }
    :host([data-variant='primary']) {
      background: var(--ui-primary);
      color: var(--ui-text-on-primary);
    }
    :host([data-variant='primary']:hover) {
      background: var(--ui-primary-hover);
      color: var(--ui-text-on-primary);
    }
    :host([data-variant='danger-soft']) {
      background: var(--ui-danger-soft);
      border-color: var(--ui-danger-border);
      color: var(--ui-danger);
    }
    :host(:focus-visible) {
      outline: none;
      box-shadow: var(--ui-focus-ring);
    }
    :host(:disabled) {
      opacity: 0.5;
      pointer-events: none;
    }
  `,
})
export class OdlqIconButton {
  readonly icon = input.required<OdlqIconName>();
  /** Nome acessível da ação. */
  readonly label = input.required<string>();
  readonly variant = input<OdlqIconButtonVariant>('ghost');
  readonly size = input<OdlqSize>('md');
  readonly round = input(false, { transform: booleanAttribute });
}
