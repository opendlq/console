import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import type { OdlqTone } from '../types';

/** Etiqueta de estado/contagem (STABLE, RUNNING, 20…). `mono` aplica o estilo técnico em caixa alta. */
@Component({
  selector: 'odlq-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-tone]': 'tone()', '[attr.data-mono]': 'mono() || null', '[attr.data-pill]': 'pill() || null' },
  template: `@if (dot()) {<span class="dot" aria-hidden="true"></span>}<ng-content />`,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      height: 20px;
      padding: 0 7px;
      border: 1px solid transparent;
      border-radius: var(--ui-radius-sm);
      background: var(--ui-neutral-soft);
      color: var(--ui-text-muted);
      font-size: var(--ui-text-xs);
      font-weight: 500;
      line-height: 1;
      white-space: nowrap;
    }
    :host([data-pill]) {
      border-radius: var(--ui-radius-pill);
    }
    :host([data-mono]) {
      font-family: var(--ui-font-mono);
      font-size: var(--ui-text-2xs);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    :host([data-tone='primary']) {
      background: var(--ui-primary-soft);
      color: var(--ui-primary-soft-fg);
    }
    :host([data-tone='success']) {
      background: var(--ui-success-soft);
      color: var(--ui-success);
    }
    :host([data-tone='danger']) {
      background: var(--ui-danger-soft);
      color: var(--ui-danger);
    }
    :host([data-tone='warning']) {
      background: var(--ui-warning-soft);
      color: var(--ui-warning);
    }
    :host([data-tone='info']) {
      background: var(--ui-info-soft);
      color: var(--ui-info);
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
  `,
})
export class OdlqBadge {
  readonly tone = input<OdlqTone>('neutral');
  readonly mono = input(false, { transform: booleanAttribute });
  readonly pill = input(false, { transform: booleanAttribute });
  readonly dot = input(false, { transform: booleanAttribute });
}
