import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import type { OdlqSize } from '../types';

export type OdlqButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'danger-soft';

/** Botão de ação. Use como atributo em `<button>` ou `<a>`: `<button odlq-button variant="primary">`. */
@Component({
  selector: 'button[odlq-button], a[odlq-button]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.aria-busy]': 'loading() || null',
    '[attr.aria-disabled]': 'loading() || null',
  },
  template: `@if (loading()) {<span class="spinner" aria-hidden="true"></span>}<ng-content />`,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: var(--ui-control-h-md);
      padding: 0 12px;
      border: 1px solid transparent;
      border-radius: var(--ui-radius-md);
      font: 500 var(--ui-text-md) / 1 var(--ui-font-sans);
      white-space: nowrap;
      text-decoration: none;
      cursor: pointer;
      user-select: none;
      transition:
        background var(--ui-transition),
        border-color var(--ui-transition),
        box-shadow var(--ui-transition);
    }
    :host([data-size='sm']) {
      height: var(--ui-control-h-sm);
      padding: 0 10px;
      font-size: var(--ui-text-sm);
    }
    :host([data-size='lg']) {
      height: var(--ui-control-h-lg);
      padding: 0 16px;
      font-size: var(--ui-text-lg);
    }
    :host([data-variant='primary']) {
      background: var(--ui-primary);
      color: var(--ui-text-on-primary);
    }
    :host([data-variant='primary']:hover) {
      background: var(--ui-primary-hover);
    }
    :host([data-variant='secondary']) {
      background: var(--ui-surface-hover);
      color: var(--ui-text);
    }
    :host([data-variant='secondary']:hover) {
      background: var(--ui-border);
    }
    :host([data-variant='outline']) {
      background: var(--ui-surface);
      border-color: var(--ui-border-strong);
      color: var(--ui-text);
    }
    :host([data-variant='outline']:hover) {
      background: var(--ui-surface-hover);
    }
    :host([data-variant='ghost']) {
      background: transparent;
      color: var(--ui-text-muted);
    }
    :host([data-variant='ghost']:hover) {
      background: var(--ui-surface-hover);
      color: var(--ui-text);
    }
    :host([data-variant='danger']) {
      background: var(--ui-danger);
      color: #fff;
    }
    :host([data-variant='danger']:hover) {
      filter: brightness(0.92);
    }
    :host([data-variant='danger-soft']) {
      background: var(--ui-danger-soft);
      border-color: var(--ui-danger-border);
      color: var(--ui-danger);
    }
    :host([data-variant='danger-soft']:hover) {
      filter: brightness(0.96);
    }
    :host(:focus-visible) {
      outline: none;
      box-shadow: var(--ui-focus-ring);
    }
    :host(:disabled),
    :host([aria-disabled='true']) {
      opacity: 0.5;
      pointer-events: none;
    }
    .spinner {
      width: 12px;
      height: 12px;
      border: 2px solid currentColor;
      border-right-color: transparent;
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
export class OdlqButton {
  readonly variant = input<OdlqButtonVariant>('secondary');
  readonly size = input<OdlqSize>('md');
  /** Mostra spinner e bloqueia cliques. */
  readonly loading = input(false, { transform: booleanAttribute });
}
