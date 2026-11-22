import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, output } from '@angular/core';
import { OdlqIcon } from '../icon/icon';
import type { OdlqIconName } from '../icon/icons';

export type OdlqAlertTone = 'danger' | 'warning' | 'info' | 'success';

const ICON: Record<OdlqAlertTone, OdlqIconName> = {
  danger: 'circle-alert',
  warning: 'warning',
  info: 'info',
  success: 'circle-check',
};

/** Banner de feedback ("Attention: Your connector configuration is invalid."). */
@Component({
  selector: 'odlq-alert',
  imports: [OdlqIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': 'tone() === "danger" || tone() === "warning" ? "alert" : "status"',
    '[attr.data-tone]': 'tone()',
  },
  template: `
    <odlq-icon [name]="icon()" [size]="16" class="ico" />
    <div class="body">
      @if (heading()) {
        <strong>{{ heading() }}</strong>
      }
      <ng-content />
    </div>
    @if (closable()) {
      <button type="button" aria-label="Dismiss" (click)="closed.emit()"><odlq-icon name="close" [size]="14" /></button>
    }
  `,
  styles: `
    :host {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 10px 12px;
      border: 1px solid transparent;
      border-radius: var(--ui-radius-md);
      font-size: var(--ui-text-md);
      line-height: 1.45;
    }
    .ico {
      margin-top: 1px;
    }
    .body {
      flex: 1;
      min-width: 0;
    }
    strong {
      margin-right: 4px;
      font-weight: 600;
    }
    :host([data-tone='danger']) {
      background: var(--ui-danger-soft);
      border-color: var(--ui-danger-border);
      color: var(--ui-danger);
    }
    :host([data-tone='warning']) {
      background: var(--ui-warning-soft);
      color: var(--ui-warning);
    }
    :host([data-tone='info']) {
      background: var(--ui-info-soft);
      color: var(--ui-info);
    }
    :host([data-tone='success']) {
      background: var(--ui-success-soft);
      color: var(--ui-success);
    }
    button {
      display: grid;
      place-items: center;
      padding: 2px;
      border: 0;
      border-radius: var(--ui-radius-sm);
      background: transparent;
      color: inherit;
      cursor: pointer;
      opacity: 0.7;
    }
    button:hover {
      opacity: 1;
    }
  `,
})
export class OdlqAlert {
  readonly tone = input<OdlqAlertTone>('danger');
  readonly heading = input('');
  readonly closable = input(false, { transform: booleanAttribute });
  readonly closed = output<void>();
  protected readonly icon = computed(() => ICON[this.tone()]);
}
