import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { OdlqBadge } from '../badge/badge';
import { OdlqCellDef, OdlqDataTable, type OdlqColumn } from '../data-table/data-table';
import type { ActorKind, Transition } from '../domain';
import { OdlqEmptyState } from '../empty-state/empty-state';
import { OdlqIcon } from '../icon/icon';
import type { OdlqIconName } from '../icon/icons';
import { OdlqStateBadge } from './state-badge';

const ICON: Record<ActorKind, OdlqIconName> = { person: 'team', agent: 'sparkles', runbook: 'book', controller: 'server' };
const COLUMNS: OdlqColumn<Transition>[] = [
  { key: 'at', header: 'When', sortable: true, mono: true },
  { key: 'actor', header: 'Who' },
  { key: 'action', header: 'Action' },
  { key: 'target', header: 'Target', mono: true },
  { key: 'to', header: 'Moved to' },
  { key: 'result', header: 'Result' },
  { key: 'note', header: 'Note' },
];

/** Registro de auditoria: pessoa, agente, runbook ou controller; o que fez, em quê e com que resultado. */
@Component({
  selector: 'odlq-audit-log',
  imports: [OdlqDataTable, OdlqCellDef, OdlqIcon, OdlqBadge, OdlqStateBadge, OdlqEmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <odlq-data-table [columns]="columns" [rows]="entries()" [rowKey]="rowKey" density="compact" caption="Audit log">
      <ng-template odlqCell="actor" let-row>
        <span class="who"><odlq-icon [name]="icon(row.actor)" [size]="14" /> <span>{{ row.by }}</span></span>
      </ng-template>
      <ng-template odlqCell="target" let-row>{{ row.target }}@if (row.count) { <span class="n">×{{ row.count }}</span> }</ng-template>
      <ng-template odlqCell="to" let-v="value">@if (v) { <odlq-state-badge [state]="v" /> } @else { — }</ng-template>
      <ng-template odlqCell="result" let-v="value"><odlq-badge mono [tone]="v === 'ok' ? 'success' : 'danger'">{{ v }}</odlq-badge></ng-template>
      <ng-template odlqCell="note" let-v="value"><span class="note">{{ v }}</span></ng-template>
      <odlq-empty-state empty title="No audit entries" description="Every state change is recorded here and is never purged." />
    </odlq-data-table>
  `,
  styles: `
    .who {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .n {
      margin-left: 6px;
      color: var(--ui-text-muted);
    }
    .note {
      color: var(--ui-text-muted);
    }
  `,
})
export class OdlqAuditLog {
  readonly entries = input.required<Transition[]>();
  protected readonly columns = COLUMNS;
  protected readonly rowKey = (t: Transition) => t.id;
  protected readonly icon = (a: ActorKind) => ICON[a];
}
