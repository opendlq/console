import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';
import { OdlqIcon } from '../icon/icon';

/** Chip de filtro aplicado (ex.: `js: city-2 ×`). */
@Component({
  selector: 'odlq-chip',
  imports: [OdlqIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-dashed]': 'dashed() || null' },
  template: `
    @if (draggable()) {
      <odlq-icon name="grip" [size]="12" class="grip" />
    }
    <span class="text"><ng-content /></span>
    @if (removable()) {
      <button type="button" [attr.aria-label]="removeLabel()" (click)="removed.emit()">
        <odlq-icon name="close" [size]="12" />
      </button>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      height: 22px;
      padding: 0 6px;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-sm);
      background: var(--ui-surface-muted);
      font-size: var(--ui-text-xs);
      color: var(--ui-text);
      white-space: nowrap;
    }
    :host([data-dashed]) {
      border-style: dashed;
      background: transparent;
      color: var(--ui-text-muted);
    }
    .grip {
      color: var(--ui-text-subtle);
      cursor: grab;
    }
    .text {
      display: inline-flex;
      gap: 4px;
    }
    button {
      display: grid;
      place-items: center;
      width: 16px;
      height: 16px;
      padding: 0;
      border: 0;
      border-radius: var(--ui-radius-xs);
      background: transparent;
      color: var(--ui-text-subtle);
      cursor: pointer;
    }
    button:hover {
      background: var(--ui-surface-hover);
      color: var(--ui-text);
    }
  `,
})
export class OdlqChip {
  readonly removable = input(false, { transform: booleanAttribute });
  readonly draggable = input(false, { transform: booleanAttribute });
  readonly dashed = input(false, { transform: booleanAttribute });
  readonly removeLabel = input('Remove');
  readonly removed = output<void>();
}
