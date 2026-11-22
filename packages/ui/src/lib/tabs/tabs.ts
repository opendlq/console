import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { OdlqBadge } from '../badge/badge';
import { nextId } from '../types';

export interface OdlqTab {
  value: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

/**
 * Lista de abas (`role=tablist`). Renderize o painel com `@switch (selected())`.
 * Cada aba tem id `<tabs-id>-tab-<value>` para usar em `aria-labelledby` do painel.
 */
@Component({
  selector: 'odlq-tabs',
  imports: [OdlqBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'tablist', '[attr.aria-label]': 'label() || null', '[attr.data-variant]': 'variant()' },
  template: `
    @for (t of tabs(); track t.value; let i = $index) {
      <button
        type="button"
        role="tab"
        [id]="id + '-tab-' + t.value"
        [attr.aria-selected]="t.value === selected()"
        [tabindex]="t.value === selected() ? 0 : -1"
        [disabled]="t.disabled"
        (click)="selected.set(t.value)"
        (keydown)="onKey($event, i)"
      >
        {{ t.label }}
        @if (t.count !== undefined) {
          <odlq-badge pill>{{ t.count }}</odlq-badge>
        }
      </button>
    }
  `,
  styles: `
    :host {
      display: flex;
      gap: 4px;
    }
    :host([data-variant='underline']) {
      gap: 20px;
      border-bottom: 1px solid var(--ui-border);
    }
    button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 32px;
      padding: 0 2px;
      border: 0;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      background: transparent;
      color: var(--ui-text-muted);
      font-size: var(--ui-text-md);
      font-weight: 500;
      cursor: pointer;
    }
    button:hover {
      color: var(--ui-text);
    }
    button[aria-selected='true'] {
      border-bottom-color: var(--ui-primary);
      color: var(--ui-primary-soft-fg);
    }
    button:focus-visible {
      outline: 2px solid var(--ui-primary);
      outline-offset: 2px;
      border-radius: var(--ui-radius-sm);
    }
    button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    :host([data-variant='pill']) button {
      padding: 0 12px;
      margin: 0;
      border: 1px solid transparent;
      border-radius: var(--ui-radius-md);
    }
    :host([data-variant='pill']) button[aria-selected='true'] {
      border-color: var(--ui-border);
      background: var(--ui-surface-hover);
      color: var(--ui-text);
    }
  `,
})
export class OdlqTabs {
  readonly tabs = input.required<OdlqTab[]>();
  readonly selected = model<string>('');
  readonly variant = input<'underline' | 'pill'>('underline');
  readonly label = input('');
  protected readonly id = nextId('odlq-tabs');

  protected onKey(e: KeyboardEvent, i: number): void {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const enabled = this.tabs().filter((t) => !t.disabled);
    const cur = enabled.findIndex((t) => t.value === this.tabs()[i].value);
    const next = enabled[(cur + dir + enabled.length) % enabled.length];
    this.selected.set(next.value);
    (document.getElementById(`${this.id}-tab-${next.value}`) as HTMLElement | null)?.focus();
  }
}
