import { ChangeDetectionStrategy, Component, booleanAttribute, input, model } from '@angular/core';
import { OdlqControl, provideControl } from '../form/control';

@Component({
  selector: 'odlq-textarea',
  providers: [provideControl(() => OdlqTextarea)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <textarea
      [value]="value()"
      [rows]="rows()"
      [placeholder]="placeholder()"
      [disabled]="isDisabled()"
      [class.mono]="mono()"
      [class.invalid]="invalid()"
      [attr.aria-label]="label() || null"
      [attr.aria-invalid]="invalid() || null"
      (input)="commit($any($event.target).value)"
      (blur)="onTouched()"
    ></textarea>
  `,
  styles: `
    :host {
      display: block;
    }
    textarea {
      display: block;
      width: 100%;
      padding: 8px 10px;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-md);
      background: var(--ui-surface-muted);
      font-size: var(--ui-text-md);
      line-height: 1.5;
      resize: vertical;
      transition:
        border-color var(--ui-transition),
        box-shadow var(--ui-transition);
    }
    textarea.mono {
      font-family: var(--ui-font-mono);
      font-size: var(--ui-text-sm);
    }
    textarea::placeholder {
      color: var(--ui-text-subtle);
    }
    textarea:hover {
      border-color: var(--ui-border-strong);
    }
    textarea:focus {
      outline: 0;
      border-color: var(--ui-primary);
      background: var(--ui-surface);
      box-shadow: var(--ui-focus-ring);
    }
    textarea.invalid {
      border-color: var(--ui-danger);
    }
    textarea:disabled {
      opacity: 0.55;
    }
  `,
})
export class OdlqTextarea extends OdlqControl<string> {
  readonly value = model('');
  readonly rows = input(4);
  readonly placeholder = input('');
  readonly mono = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly label = input('');
}
