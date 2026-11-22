import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { OdlqIcon } from '../icon/icon';
import { OdlqTooltip } from '../tooltip/tooltip';
import { nextId } from '../types';

/** Rótulo + controle + dica/erro. O controle é projetado. `info` mostra um ⓘ com tooltip. */
@Component({
  selector: 'odlq-form-field',
  imports: [OdlqIcon, OdlqTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'group', '[attr.aria-labelledby]': 'labelId' },
  template: `
    <div class="head">
      <span class="label" [id]="labelId">{{ label() }}@if (required()) {<span class="req" aria-hidden="true">*</span>}</span>
      @if (info()) {
        <odlq-icon name="info" [size]="13" class="info" [odlqTooltip]="info()" tabindex="0" label="Info" />
      }
    </div>
    <ng-content />
    @if (error()) {
      <p class="msg error" role="alert">{{ error() }}</p>
    } @else if (hint()) {
      <p class="msg">{{ hint() }}</p>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .head {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .label {
      font-size: var(--ui-text-md);
      font-weight: 600;
    }
    .req {
      margin-left: 2px;
      color: var(--ui-danger);
    }
    .info {
      color: var(--ui-text-subtle);
      cursor: help;
    }
    .msg {
      margin: 0;
      font-size: var(--ui-text-sm);
      color: var(--ui-text-muted);
    }
    .msg.error {
      color: var(--ui-danger);
    }
  `,
})
export class OdlqFormField {
  readonly label = input.required<string>();
  readonly hint = input('');
  readonly error = input('');
  readonly info = input('');
  readonly required = input(false, { transform: booleanAttribute });
  protected readonly labelId = nextId('odlq-field');
}
