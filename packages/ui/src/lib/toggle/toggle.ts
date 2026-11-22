import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { OdlqControl, provideControl } from '../form/control';

/** Interruptor on/off (role=switch). O texto projetado é o rótulo. */
@Component({
  selector: 'odlq-toggle',
  providers: [provideControl(() => OdlqToggle)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      role="switch"
      [attr.aria-checked]="value()"
      [attr.aria-label]="label() || null"
      [disabled]="isDisabled()"
      (click)="commit(!value())"
      (blur)="onTouched()"
    >
      <span class="track"><span class="thumb"></span></span>
      <span class="text"><ng-content /></span>
    </button>
  `,
  styles: `
    :host {
      display: inline-block;
    }
    button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0;
      border: 0;
      background: none;
      cursor: pointer;
      font-size: var(--ui-text-md);
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .track {
      position: relative;
      flex: none;
      width: 28px;
      height: 16px;
      border-radius: var(--ui-radius-pill);
      background: var(--ui-border-strong);
      transition: background var(--ui-transition);
    }
    .thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #fff;
      box-shadow: var(--ui-shadow-sm);
      transition: transform var(--ui-transition);
    }
    [aria-checked='true'] .track {
      background: var(--ui-primary);
    }
    [aria-checked='true'] .thumb {
      transform: translateX(12px);
    }
    button:focus-visible {
      outline: 0;
    }
    button:focus-visible .track {
      box-shadow: var(--ui-focus-ring);
    }
    .text:empty {
      display: none;
    }
  `,
})
export class OdlqToggle extends OdlqControl<boolean> {
  readonly value = model(false);
  readonly label = input('');
}
