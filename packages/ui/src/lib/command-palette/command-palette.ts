import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, computed, effect, input, model, output, signal, viewChild, type ElementRef } from '@angular/core';
import { OdlqIcon } from '../icon/icon';
import type { OdlqIconName } from '../icon/icons';
import { OdlqKbd } from '../kbd/kbd';
import { nextId } from '../types';

export interface OdlqCommand {
  id: string;
  label: string;
  group?: string;
  icon?: OdlqIconName;
  hint?: string;
}

/** Paleta de comandos (⌘K / Ctrl+K). Filtra por texto, navega com ↑/↓, executa com Enter. */
@Component({
  selector: 'odlq-command-palette',
  imports: [CdkTrapFocus, OdlqIcon, OdlqKbd],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'onDocKey($event)' },
  template: `
    @if (open()) {
      <div class="scrim" (click)="open.set(false)"></div>
      <div class="dialog" role="dialog" aria-modal="true" aria-label="Command palette" cdkTrapFocus>
        <div class="search">
          <odlq-icon name="search" [size]="16" />
          <input
            #field
            type="text"
            role="combobox"
            aria-expanded="true"
            [attr.aria-controls]="listId"
            [attr.aria-activedescendant]="results().length ? listId + '-' + active() : null"
            [placeholder]="placeholder()"
            [value]="query()"
            (input)="query.set($any($event.target).value); active.set(0)"
            (keydown)="onKey($event)"
          />
          <kbd odlq-kbd>esc</kbd>
        </div>
        <ul class="list" role="listbox" [id]="listId">
          @for (c of results(); track c.id; let i = $index) {
            @if (i === 0 || results()[i - 1].group !== c.group) {
              @if (c.group) {
                <li class="group" role="presentation">{{ c.group }}</li>
              }
            }
            <li role="option" [id]="listId + '-' + i" [class.active]="i === active()" [attr.aria-selected]="i === active()" (mouseenter)="active.set(i)" (click)="run(c)">
              @if (c.icon) {
                <odlq-icon [name]="c.icon" [size]="16" />
              }
              <span class="label">{{ c.label }}</span>
              @if (c.hint) {
                <span class="hint">{{ c.hint }}</span>
              }
            </li>
          } @empty {
            <li class="empty" role="presentation">No results for “{{ query() }}”</li>
          }
        </ul>
      </div>
    }
  `,
  styles: `
    .scrim {
      position: fixed;
      inset: 0;
      z-index: var(--ui-z-drawer);
      background: var(--ui-overlay);
    }
    .dialog {
      position: fixed;
      top: 14vh;
      left: 50%;
      z-index: calc(var(--ui-z-drawer) + 1);
      width: min(560px, calc(100vw - 32px));
      transform: translateX(-50%);
      overflow: hidden;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-xl);
      background: var(--ui-surface);
      box-shadow: var(--ui-shadow-lg);
    }
    .search {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 16px;
      height: 52px;
      border-bottom: 1px solid var(--ui-border);
      color: var(--ui-text-subtle);
    }
    input {
      flex: 1;
      height: 100%;
      border: 0;
      outline: 0;
      background: transparent;
      font-size: var(--ui-text-lg);
      color: var(--ui-text);
    }
    .list {
      max-height: 340px;
      margin: 0;
      padding: 6px;
      overflow: auto;
      list-style: none;
    }
    li[role='option'] {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-radius: var(--ui-radius-md);
      cursor: pointer;
      font-size: var(--ui-text-md);
    }
    li.active {
      background: var(--ui-primary-soft);
      color: var(--ui-primary-soft-fg);
    }
    .label {
      flex: 1;
    }
    .hint {
      color: var(--ui-text-subtle);
      font: var(--ui-text-xs) var(--ui-font-mono);
    }
    .group {
      padding: 8px 10px 4px;
      color: var(--ui-text-subtle);
      font: 500 var(--ui-text-2xs) / 1 var(--ui-font-mono);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .empty {
      padding: 20px;
      color: var(--ui-text-muted);
      text-align: center;
    }
  `,
})
export class OdlqCommandPalette {
  readonly open = model(false);
  readonly commands = input<OdlqCommand[]>([]);
  readonly placeholder = input('Type a command or search…');
  readonly commandRun = output<OdlqCommand>();

  protected readonly listId = nextId('odlq-cmd');
  protected readonly query = signal('');
  protected readonly active = signal(0);
  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');

  protected readonly results = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? this.commands().filter((c) => `${c.label} ${c.group ?? ''}`.toLowerCase().includes(q)) : this.commands();
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        this.query.set('');
        this.active.set(0);
        queueMicrotask(() => this.field()?.nativeElement.focus());
      }
    });
  }

  protected onDocKey(e: KeyboardEvent): void {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.open.update((o) => !o);
    }
  }

  protected onKey(e: KeyboardEvent): void {
    const n = this.results().length;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (n) this.active.update((i) => (e.key === 'ArrowDown' ? (i + 1) % n : (i - 1 + n) % n));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const c = this.results()[this.active()];
      if (c) this.run(c);
    } else if (e.key === 'Escape') {
      this.open.set(false);
    }
  }

  protected run(c: OdlqCommand): void {
    this.commandRun.emit(c);
    this.open.set(false);
  }
}
