import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TopicsStore, topicHealth, type DlqTopic } from '@opendlq/modules';
import { OdlqCellDef, OdlqDataTable, OdlqInput, OdlqPageHeader, OdlqStatusBadge, type OdlqColumn } from '@opendlq/ui';

const COLUMNS: OdlqColumn<DlqTopic>[] = [
  { key: 'name', header: 'Dead letter topic', sortable: true, mono: true },
  { key: 'sourceTopic', header: 'Source topic', mono: true },
  { key: 'partitions', header: 'Partitions', sortable: true, mono: true, align: 'end' },
  { key: 'deadLetters', header: 'Dead letters', sortable: true, mono: true, align: 'end' },
  { key: 'parked', header: 'Parked', sortable: true, mono: true, align: 'end' },
  { key: 'oldest', header: 'Oldest', mono: true, align: 'end' },
  { key: 'health', header: 'Health', accessor: topicHealth },
];

@Component({
  selector: 'odlq-topics-page',
  imports: [OdlqPageHeader, OdlqInput, OdlqDataTable, OdlqCellDef, OdlqStatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topics.html',
  styleUrl: './topics.css',
})
export class TopicsPage {
  private readonly router = inject(Router);
  protected readonly store = inject(TopicsStore);
  protected readonly columns = COLUMNS;
  protected readonly rowKey = (t: DlqTopic) => t.name;

  protected open(t: DlqTopic): void {
    void this.router.navigate(['/topics', t.name]);
  }
}
