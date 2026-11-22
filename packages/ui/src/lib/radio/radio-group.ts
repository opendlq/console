import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { OdlqControl, provideControl } from '../form/control';
import { nextId, type OdlqOption } from '../types';

@Component({
  selector: 'odlq-radio-group',
  providers: [provideControl(() => OdlqRadioGroup)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'radiogroup', '[attr.aria-label]': 'label() || null', '[attr.data-orientation]': 'orientation()' },
  template: `
    @for (o of options(); track o.value) {
      <label [class.disabled]="isDisabled() || o.disabled">
        <input
          type="radio"
          [name]="name"
          [value]="o.value"
          [checked]="o.value === value()"
          [disabled]="isDisabled() || o.disabled"
          (change)="commit(o.value)"
          (blur)="onTouched()"
        />
        <span class="dot" aria-hidden="true"></span>
        <span class="text">
          {{ o.label }}
          @if (o.description) {
            <small>{{ o.description }}</small>
          }
        </span>
      </label>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    :host([data-orientation='horizontal']) {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 16px;
    }
    label {
      display: inline-flex;
      align-items: flex-start;
      gap: 8px;
      cursor: pointer;
      font-size: var(--ui-text-md);
    }
    label.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    input {
      position: absolute;
      opacity: 0;
    }
    .dot {
      flex: none;
      width: 16px;
      height: 16px;
      margin-top: 1px;
      border: 1px solid var(--ui-border-strong);
      border-radius: 50%;
      background: var(--ui-surface);
      transition:
        border-color var(--ui-transition),
        box-shadow var(--ui-transition);
    }
    input:checked + .dot {
      border: 5px solid var(--ui-primary);
    }
    input:focus-visible + .dot {
      box-shadow: var(--ui-focus-ring);
    }
    small {
      display: block;
      color: var(--ui-text-muted);
      font-size: var(--ui-text-sm);
    }
  `,
})
export class OdlqRadioGroup<T = string> extends OdlqControl<T | null> {
  readonly value = model<T | null>(null);
  readonly options = input<OdlqOption<T>[]>([]);
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  readonly label = input('');
  protected readonly name = nextId('odlq-radio');
}
