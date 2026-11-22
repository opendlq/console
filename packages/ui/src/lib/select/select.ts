import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, model, signal } from '@angular/core';
import { OdlqControl, provideControl } from '../form/control';
import { OdlqIcon } from '../icon/icon';
import { nextId, type OdlqOption, type OdlqSize } from '../types';

/**
 * Select customizado (listbox via CDK Overlay). `prefix` mostra o rótulo atenuado
 * antes do valor, como em "Show from: Latest".
 */
@Component({
  selector: 'odlq-select',
  imports: [CdkConnectedOverlay, CdkOverlayOrigin, OdlqIcon],
  providers: [provideControl(() => OdlqSelect)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-size]': 'size()' },
  template: `
    <button
      type="button"
      class="trigger"
      cdkOverlayOrigin
      #origin="cdkOverlayOrigin"
      role="combobox"
      aria-haspopup="listbox"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="open() ? listId : null"
      [attr.aria-activedescendant]="open() ? listId + '-' + active() : null"
      [attr.aria-label]="label() || null"
      [disabled]="isDisabled()"
      (click)="toggle(origin.elementRef.nativeElement)"
      (keydown)="onKey($event, origin.elementRef.nativeElement)"
      (blur)="onTouched()"
    >
      @if (prefix()) {
        <span class="prefix">{{ prefix() }}</span>
      }
      <span class="value" [class.placeholder]="!selected()">{{ selected()?.label ?? placeholder() }}</span>
      <odlq-icon name="chevron-down" [size]="14" class="chev" />
    </button>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayMinWidth]="minWidth()"
      [cdkConnectedOverlayOffsetY]="4"
      (overlayOutsideClick)="close()"
      (detach)="close()"
    >
      <ul class="panel" role="listbox" [id]="listId" [attr.aria-label]="label() || placeholder()">
        @for (o of options(); track o.value; let i = $index) {
          <li
            role="option"
            [id]="listId + '-' + i"
            [class.active]="i === active()"
            [class.selected]="o.value === value()"
            [attr.aria-selected]="o.value === value()"
            [attr.aria-disabled]="o.disabled || null"
            (mouseenter)="active.set(i)"
            (click)="pick(o)"
          >
            <span>{{ o.label }}</span>
            @if (o.value === value()) {
              <odlq-icon name="check" [size]="14" />
            }
          </li>
        }
      </ul>
    </ng-template>
  `,
  styles: `
    :host {
      display: inline-block;
      min-width: 0;
    }
    .trigger {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      height: var(--ui-control-h-md);
      padding: 0 8px 0 10px;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-md);
      background: var(--ui-surface-muted);
      font-size: var(--ui-text-md);
      text-align: left;
      cursor: pointer;
      transition:
        border-color var(--ui-transition),
        box-shadow var(--ui-transition);
    }
    :host([data-size='sm']) .trigger {
      height: var(--ui-control-h-sm);
    }
    .trigger:hover {
      border-color: var(--ui-border-strong);
    }
    .trigger:focus-visible,
    .trigger[aria-expanded='true'] {
      outline: 0;
      border-color: var(--ui-primary);
      box-shadow: var(--ui-focus-ring);
    }
    .trigger:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
    .prefix {
      color: var(--ui-text-muted);
    }
    .value {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 500;
    }
    .value.placeholder {
      color: var(--ui-text-subtle);
      font-weight: 400;
    }
    .chev {
      color: var(--ui-text-subtle);
    }
    .panel {
      margin: 0;
      padding: 4px;
      max-height: 280px;
      overflow: auto;
      list-style: none;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-lg);
      background: var(--ui-surface);
      box-shadow: var(--ui-shadow-md);
      font-size: var(--ui-text-md);
    }
    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 6px 8px;
      border-radius: var(--ui-radius-sm);
      cursor: pointer;
    }
    li.active {
      background: var(--ui-surface-hover);
    }
    li.selected {
      color: var(--ui-primary-soft-fg);
      font-weight: 500;
    }
    li[aria-disabled='true'] {
      opacity: 0.5;
      pointer-events: none;
    }
  `,
})
export class OdlqSelect<T = string> extends OdlqControl<T | null> {
  readonly value = model<T | null>(null);
  readonly options = input<OdlqOption<T>[]>([]);
  readonly placeholder = input('Select…');
  /** Rótulo atenuado exibido antes do valor. */
  readonly prefix = input('');
  readonly size = input<OdlqSize>('md');
  readonly label = input('');

  protected readonly listId = nextId('odlq-select');
  protected readonly open = signal(false);
  protected readonly active = signal(0);
  protected readonly minWidth = signal(0);
  protected readonly selected = computed(() => this.options().find((o) => o.value === this.value()) ?? null);

  protected toggle(trigger: HTMLElement): void {
    if (this.open()) return this.close();
    this.minWidth.set(trigger.offsetWidth);
    const i = this.options().findIndex((o) => o.value === this.value());
    this.active.set(Math.max(i, 0));
    this.open.set(true);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected pick(o: OdlqOption<T>): void {
    if (o.disabled) return;
    this.commit(o.value);
    this.close();
  }

  protected onKey(e: KeyboardEvent, trigger: HTMLElement): void {
    const n = this.options().length;
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        e.preventDefault();
        if (!this.open()) return this.toggle(trigger);
        this.active.update((i) => (e.key === 'ArrowDown' ? (i + 1) % n : (i - 1 + n) % n));
        break;
      }
      case 'Home':
      case 'End':
        if (this.open()) {
          e.preventDefault();
          this.active.set(e.key === 'Home' ? 0 : n - 1);
        }
        break;
      case 'Enter':
      case ' ':
        if (this.open()) {
          e.preventDefault();
          const o = this.options()[this.active()];
          if (o) this.pick(o);
        }
        break;
      case 'Escape':
        if (this.open()) {
          e.preventDefault();
          this.close();
        }
        break;
    }
  }
}
