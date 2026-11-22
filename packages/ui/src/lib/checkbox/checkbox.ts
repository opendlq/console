import { ChangeDetectionStrategy, Component, booleanAttribute, input, model } from '@angular/core';
import { OdlqControl, provideControl } from '../form/control';

@Component({
  selector: 'odlq-checkbox',
  providers: [provideControl(() => OdlqCheckbox)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label [class.disabled]="isDisabled()">
      <input
        type="checkbox"
        [checked]="value()"
        [indeterminate]="indeterminate()"
        [disabled]="isDisabled()"
        [attr.aria-label]="label() || null"
        (change)="commit($any($event.target).checked)"
        (blur)="onTouched()"
      />
      <span class="box" aria-hidden="true">
        @if (indeterminate()) {
          <svg viewBox="0 0 12 12"><path d="M3 6h6" /></svg>
        } @else {
          <svg viewBox="0 0 12 12"><path d="m2.5 6.2 2.4 2.4 4.6-5" /></svg>
        }
      </span>
      <span class="text"><ng-content /></span>
    </label>
  `,
  styles: `
    :host {
      display: inline-block;
    }
    label {
      display: inline-flex;
      align-items: center;
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
      width: 16px;
      height: 16px;
      margin: 0;
    }
    .box {
      display: grid;
      place-items: center;
      flex: none;
      width: 16px;
      height: 16px;
      border: 1px solid var(--ui-border-strong);
      border-radius: var(--ui-radius-sm);
      background: var(--ui-surface);
      transition:
        background var(--ui-transition),
        border-color var(--ui-transition);
    }
    svg {
      width: 12px;
      height: 12px;
      fill: none;
      stroke: var(--ui-text-on-primary);
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: 0;
    }
    label:hover .box {
      border-color: var(--ui-primary);
    }
    input:checked + .box,
    input:indeterminate + .box {
      background: var(--ui-primary);
      border-color: var(--ui-primary);
    }
    input:checked + .box svg,
    input:indeterminate + .box svg {
      opacity: 1;
    }
    input:focus-visible + .box {
      box-shadow: var(--ui-focus-ring);
    }
    .text:empty {
      display: none;
    }
  `,
})
export class OdlqCheckbox extends OdlqControl<boolean> {
  readonly value = model(false);
  readonly indeterminate = input(false, { transform: booleanAttribute });
  /** `aria-label` quando não há texto projetado. */
  readonly label = input('');
}
