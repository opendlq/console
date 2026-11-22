import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { OdlqSparkline } from '../charts/sparkline';
import { OdlqCellDef, OdlqDataTable, type OdlqColumn, type OdlqSort } from '../data-table/data-table';
import { formatAge, type FailureGroup } from '../domain';
import { OdlqEmptyState } from '../empty-state/empty-state';
import { OdlqKindBadge } from './kind-badge';
import { OdlqStateBadge } from './state-badge';

const COLUMNS: OdlqColumn<FailureGroup>[] = [
  { key: 'reason', header: 'Cause', sortable: true },
  { key: 'kind', header: 'Kind', sortable: true },
  { key: 'consumer', header: 'Consumer', sortable: true },
  { key: 'dependency', header: 'Dependency', mono: true },
  { key: 'count', header: 'Messages', sortable: true, mono: true, align: 'end' },
  { key: 'oldestMin', header: 'Oldest', sortable: true, mono: true, align: 'end' },
  { key: 'trend', header: 'Last 12h' },
  { key: 'state', header: 'State', sortable: true },
  { key: 'runbook', header: 'Runbook', mono: true },
];

/** Falhas agrupadas por causa raiz: tipo, consumer, dependência, volume, idade, tendência e estado. */
@Component({
  selector: 'odlq-group-table',
  imports: [OdlqDataTable, OdlqCellDef, OdlqKindBadge, OdlqStateBadge, OdlqSparkline, OdlqEmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <odlq-data-table
      [columns]="columns"
      [rows]="groups()"
      [rowKey]="rowKey"
      [selectable]="selectable()"
      [(selection)]="selection"
      [(sort)]="sort"
      [clickable]="true"
      caption="Failures grouped by cause"
      (rowClick)="groupClick.emit($event)"
    >
      <ng-template odlqCell="reason" let-row>
        <span class="cause">{{ row.reason }}</span><span class="key">{{ row.key }} · by {{ row.classifiedBy }}</span>
      </ng-template>
      <ng-template odlqCell="kind" let-v="value"><odlq-kind-badge [kind]="v" /></ng-template>
      <ng-template odlqCell="dependency" let-v="value">{{ v || '—' }}</ng-template>
      <ng-template odlqCell="oldestMin" let-v="value">{{ age(v) }}</ng-template>
      <ng-template odlqCell="trend" let-row><odlq-sparkline [values]="row.trend" [label]="'Arrivals per hour for ' + row.key" /></ng-template>
      <ng-template odlqCell="state" let-v="value"><odlq-state-badge [state]="v" /></ng-template>
      <ng-template odlqCell="runbook" let-v="value">{{ v || '—' }}</ng-template>
      <odlq-empty-state empty title="No open failures" description="Nothing is waiting for recovery or for a decision." />
    </odlq-data-table>
  `,
  styles: `
    .cause {
      display: block;
      font-weight: 500;
    }
    .key {
      display: block;
      color: var(--ui-text-subtle);
      font: var(--ui-text-xs) var(--ui-font-mono);
    }
  `,
})
export class OdlqGroupTable {
  readonly groups = input.required<FailureGroup[]>();
  readonly selectable = input(true);
  readonly selection = model<FailureGroup[]>([]);
  readonly sort = model<OdlqSort | null>({ key: 'count', dir: 'desc' });
  readonly groupClick = output<FailureGroup>();

  protected readonly columns = COLUMNS;
  protected readonly rowKey = (g: FailureGroup) => g.key;
  protected readonly age = formatAge;
}
