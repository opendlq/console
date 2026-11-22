import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { OdlqControl, provideControl } from '../form/control';
import type { OdlqOption, OdlqSize } from '../types';

/** Grupo de opções mutuamente exclusivas em formato de pílulas (ex.: 1H · 1D · 7D · 30D). */
@Component({
  selector: 'odlq-segmented-control',
  providers: [provideControl(() => OdlqSegmentedControl)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'radiogroup', '[attr.aria-label]': 'label() || null', '[attr.data-size]': 'size()' },
  template: `
    @for (o of options(); track o.value; let i = $index) {
      <button
        type="button"
        role="radio"
        [attr.aria-checked]="o.value === value()"
        [tabindex]="o.value === value() || (value() === null && i === 0) ? 0 : -1"
        [disabled]="isDisabled() || o.disabled"
        (click)="commit(o.value)"
        (keydown)="onKey($event, i)"
        (blur)="onTouched()"
      >
        {{ o.label }}
      </button>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      gap: 2px;
      padding: 2px;
      border-radius: var(--ui-radius-md);
      background: var(--ui-surface-hover);
    }
    button {
      height: 26px;
      padding: 0 10px;
      border: 1px solid transparent;
      border-radius: var(--ui-radius-sm);
      background: transparent;
      color: var(--ui-text-muted);
      font-size: var(--ui-text-sm);
      font-weight: 500;
      cursor: pointer;
      transition:
        background var(--ui-transition),
        color var(--ui-transition);
    }
    :host([data-size='sm']) button {
      height: 22px;
      padding: 0 8px;
      font-size: var(--ui-text-xs);
    }
    button:hover {
      color: var(--ui-text);
    }
    button[aria-checked='true'] {
      background: var(--ui-surface);
      border-color: var(--ui-border);
      color: var(--ui-text);
      box-shadow: var(--ui-shadow-sm);
    }
    button:focus-visible {
      outline: 0;
      box-shadow: var(--ui-focus-ring);
    }
    button:disabled {
      opacity: 0.5;
    }
  `,
})
export class OdlqSegmentedControl<T = string> extends OdlqControl<T | null> {
  readonly value = model<T | null>(null);
  readonly options = input<OdlqOption<T>[]>([]);
  readonly size = input<OdlqSize>('md');
  readonly label = input('');

  protected onKey(e: KeyboardEvent, i: number): void {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const opts = this.options();
    const next = opts[(i + dir + opts.length) % opts.length];
    this.commit(next.value);
    ((e.currentTarget as HTMLElement).parentElement?.children[(i + dir + opts.length) % opts.length] as HTMLElement)?.focus();
  }
}
