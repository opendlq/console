import { ChangeDetectionStrategy, Component, booleanAttribute, input, model, output } from '@angular/core';
import { OdlqCellDef, OdlqDataTable, type OdlqColumn, type OdlqSort } from '../data-table/data-table';
import type { DlqMessage } from '../domain';
import { OdlqEmptyState } from '../empty-state/empty-state';
import { OdlqKindBadge } from './kind-badge';
import { OdlqStateBadge } from './state-badge';

const COLUMNS: OdlqColumn<DlqMessage>[] = [
  { key: 'receivedAt', header: 'Received', sortable: true, mono: true },
  { key: 'id', header: 'Message', mono: true, accessor: (m) => m.id.slice(0, 8) },
  { key: 'partitionKey', header: 'Key', mono: true },
  { key: 'reason', header: 'Reason', sortable: true },
  { key: 'kind', header: 'Kind', sortable: true },
  { key: 'attempts', header: 'Attempts', mono: true, align: 'end', sortable: true, accessor: (m) => m.attempts.filter((a) => a.outcome === 'failed').length },
  { key: 'state', header: 'State', sortable: true },
];

/** Mensagens de uma causa (ou de qualquer filtro): chegada, id, chave de partição, motivo, tipo, tentativas e estado. */
@Component({
  selector: 'odlq-message-table',
  imports: [OdlqDataTable, OdlqCellDef, OdlqStateBadge, OdlqKindBadge, OdlqEmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <odlq-data-table
      [columns]="columns"
      [rows]="messages()"
      [rowKey]="rowKey"
      [selectable]="selectable()"
      [(selection)]="selection"
      [(sort)]="sort"
      [clickable]="true"
      [activeRow]="activeMessage()"
      [maxHeight]="maxHeight()"
      caption="Failed messages"
      (rowClick)="messageClick.emit($event)"
    >
      <ng-template odlqCell="kind" let-v="value"><odlq-kind-badge [kind]="v" /></ng-template>
      <ng-template odlqCell="state" let-v="value"><odlq-state-badge [state]="v" /></ng-template>
      <odlq-empty-state empty [title]="emptyTitle()" [description]="emptyDescription()" />
    </odlq-data-table>
  `,
})
export class OdlqMessageTable {
  readonly messages = input.required<DlqMessage[]>();
  readonly selectable = input(true, { transform: booleanAttribute });
  readonly selection = model<DlqMessage[]>([]);
  readonly sort = model<OdlqSort | null>(null);
  readonly activeMessage = input<DlqMessage | null>(null);
  readonly maxHeight = input<string | null>(null);
  readonly emptyTitle = input('No messages match your filters.');
  readonly emptyDescription = input('Try other parameters.');
  readonly messageClick = output<DlqMessage>();

  protected readonly columns = COLUMNS;
  protected readonly rowKey = (m: DlqMessage) => m.id;
}
