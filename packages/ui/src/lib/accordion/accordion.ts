import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { OdlqIcon } from '../icon/icon';
import { nextId } from '../types';

/** Container de seções recolhíveis (Produce: Key / Value / Headers / Flow / Options). */
@Component({
  selector: 'odlq-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: `
    :host {
      display: block;
      overflow: hidden;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-lg);
      background: var(--ui-surface);
    }
  `,
})
export class OdlqAccordion {}

@Component({
  selector: 'odlq-accordion-item',
  imports: [OdlqIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>
      <button type="button" [id]="id + '-h'" [attr.aria-expanded]="expanded()" [attr.aria-controls]="id + '-p'" (click)="expanded.set(!expanded())">
        <span>{{ heading() }}</span>
        <odlq-icon [name]="expanded() ? 'chevron-up' : 'chevron-down'" [size]="16" />
      </button>
    </h2>
    <div class="panel" [id]="id + '-p'" role="region" [attr.aria-labelledby]="id + '-h'" [hidden]="!expanded()">
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: block;
      border-bottom: 1px solid var(--ui-border);
    }
    :host(:last-child) {
      border-bottom: 0;
    }
    h2 {
      margin: 0;
    }
    button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 44px;
      padding: 0 16px;
      border: 0;
      background: transparent;
      font-size: var(--ui-text-md);
      font-weight: 600;
      text-align: left;
      cursor: pointer;
    }
    button:hover {
      background: var(--ui-surface-muted);
    }
    button:focus-visible {
      outline: 2px solid var(--ui-primary);
      outline-offset: -2px;
    }
    .panel {
      padding: 0 16px 16px;
    }
  `,
})
export class OdlqAccordionItem {
  readonly heading = input.required<string>();
  readonly expanded = model(false);
  protected readonly id = nextId('odlq-acc');
}
