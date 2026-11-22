import { ChangeDetectionStrategy, Component, booleanAttribute, input, model } from '@angular/core';
import { OdlqControl, provideControl } from '../form/control';
import { OdlqIcon } from '../icon/icon';
import type { OdlqIconName } from '../icon/icons';
import type { OdlqSize } from '../types';

/** Campo de texto de uma linha, com ícone à esquerda e slot à direita (ex.: atalho `<kbd>`). */
@Component({
  selector: 'odlq-input',
  imports: [OdlqIcon],
  providers: [provideControl(() => OdlqInput)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-size]': 'size()' },
  template: `
    <div class="box" [class.invalid]="invalid()" [class.disabled]="isDisabled()">
      @if (icon(); as name) {
        <odlq-icon [name]="name" [size]="14" class="lead" />
      }
      <input
        [type]="type()"
        [value]="value()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [readOnly]="readonly()"
        [attr.aria-label]="label() || null"
        [attr.aria-invalid]="invalid() || null"
        [attr.autocomplete]="'off'"
        (input)="commit($any($event.target).value)"
        (blur)="onTouched()"
      />
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .box {
      display: flex;
      align-items: center;
      gap: 8px;
      height: var(--ui-control-h-md);
      padding: 0 10px;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-md);
      background: var(--ui-surface-muted);
      transition:
        border-color var(--ui-transition),
        box-shadow var(--ui-transition),
        background var(--ui-transition);
    }
    :host([data-size='sm']) .box {
      height: var(--ui-control-h-sm);
    }
    :host([data-size='lg']) .box {
      height: var(--ui-control-h-lg);
    }
    .box:hover {
      border-color: var(--ui-border-strong);
    }
    .box:focus-within {
      border-color: var(--ui-primary);
      background: var(--ui-surface);
      box-shadow: var(--ui-focus-ring);
    }
    .box.invalid {
      border-color: var(--ui-danger);
    }
    .box.disabled {
      opacity: 0.55;
    }
    .lead {
      color: var(--ui-text-subtle);
    }
    input {
      flex: 1;
      min-width: 0;
      height: 100%;
      border: 0;
      outline: 0;
      background: transparent;
      font-size: var(--ui-text-md);
      color: var(--ui-text);
    }
    input::placeholder {
      color: var(--ui-text-subtle);
    }
  `,
})
export class OdlqInput extends OdlqControl<string> {
  readonly value = model('');
  readonly type = input<'text' | 'search' | 'number' | 'email' | 'password' | 'url'>('text');
  readonly placeholder = input('');
  readonly icon = input<OdlqIconName | null>(null);
  readonly size = input<OdlqSize>('md');
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  /** `aria-label` quando não há <odlq-form-field> com rótulo. */
  readonly label = input('');
}
