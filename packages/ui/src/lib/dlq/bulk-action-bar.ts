import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { OdlqButton } from '../button/button';
import { OdlqIconButton } from '../button/icon-button';
import { OdlqIcon } from '../icon/icon';

/** Ações do operador sobre o que está selecionado (mensagens ou grupos): replay, editar e reenviar, reclassificar, descartar. */
@Component({
  selector: 'odlq-bulk-action-bar',
  imports: [OdlqButton, OdlqIconButton, OdlqIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'toolbar', 'aria-label': 'Operator actions', '[hidden]': 'count() === 0' },
  template: `
    <span class="count" aria-live="polite"><strong>{{ count() }}</strong> {{ noun() }} selected</span>
    <span class="sep" aria-hidden="true"></span>
    <button odlq-button size="sm" variant="primary" (click)="replay.emit()"><odlq-icon name="reprocess" [size]="14" /> Replay</button>
    @if (editable()) {
      <button odlq-button size="sm" variant="outline" (click)="editReplay.emit()"><odlq-icon name="edit" [size]="14" /> Edit and replay</button>
    }
    <button odlq-button size="sm" variant="outline" (click)="reclassify.emit()"><odlq-icon name="tag" [size]="14" /> Reclassify</button>
    <button odlq-button size="sm" variant="danger-soft" (click)="discard.emit()"><odlq-icon name="discard" [size]="14" /> Discard</button>
    <button odlq-icon-button class="clear" size="sm" icon="close" label="Clear selection" (click)="cleared.emit()"></button>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-lg);
      background: var(--ui-primary-soft);
    }
    :host([hidden]) {
      display: none;
    }
    .count {
      font-size: var(--ui-text-md);
    }
    .sep {
      width: 1px;
      height: 18px;
      margin: 0 4px;
      background: var(--ui-border-strong);
    }
    .clear {
      margin-left: auto;
    }
  `,
})
export class OdlqBulkActionBar {
  readonly count = input.required<number>();
  readonly noun = input('message(s)');
  /** "Edit and replay" só faz sentido para mensagens (payload), não para grupos. */
  readonly editable = input(true);
  readonly replay = output<void>();
  readonly editReplay = output<void>();
  readonly reclassify = output<void>();
  readonly discard = output<void>();
  readonly cleared = output<void>();
}
