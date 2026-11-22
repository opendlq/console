import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { OdlqBadge } from '../badge/badge';
import { OdlqButton } from '../button/button';
import { OdlqEmptyState } from '../empty-state/empty-state';
import { DLQ_MESSAGES, TOPIC_CONFIG, type DlqMessage } from '../mocks';
import { OdlqCellDef, OdlqDataTable, type OdlqColumn } from './data-table';
import { OdlqKeyValueTable } from './key-value-table';

const columns: OdlqColumn<DlqMessage>[] = [
  { key: 'timestamp', header: 'Timestamp', sortable: true },
  { key: 'offset', header: 'Offset', sortable: true, mono: true },
  { key: 'partition', header: 'Partition', sortable: true, mono: true },
  { key: 'key', header: 'Key', mono: true },
  { key: 'originalTopic', header: 'Original topic' },
  { key: 'retries', header: 'Retries', align: 'end', mono: true },
  { key: 'status', header: 'Status' },
];

const meta: Meta<OdlqDataTable<DlqMessage>> = {
  title: 'Dados/DataTable',
  component: OdlqDataTable,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [OdlqDataTable, OdlqCellDef, OdlqBadge, OdlqKeyValueTable, OdlqEmptyState, OdlqButton] })],
  args: { density: 'comfortable' },
  argTypes: { density: { control: 'inline-radio', options: ['comfortable', 'compact'] } },
  render: (args) => ({
    props: { ...args, columns, rows: DLQ_MESSAGES.slice(0, 8) },
    template: `<odlq-data-table [columns]="columns" [rows]="rows" [density]="density" caption="Dead letter messages" />`,
  }),
};
export default meta;
type Story = StoryObj<OdlqDataTable<DlqMessage>>;

export const Basica: Story = { name: 'Básica (ordenável)' };

export const SelecaoECelulas: Story = {
  name: 'Seleção + células customizadas',
  render: () => ({
    props: { columns, rows: DLQ_MESSAGES.slice(0, 8), selected: [] as DlqMessage[] },
    template: `
      <odlq-data-table [columns]="columns" [rows]="rows" [selectable]="true" [(selection)]="selected" [clickable]="true" caption="Dead letter messages">
        <ng-template odlqCell="status" let-row>
          <odlq-badge mono [tone]="row.status === 'resolved' ? 'success' : row.status === 'parked' ? 'danger' : row.status === 'retrying' ? 'warning' : 'neutral'">{{ row.status }}</odlq-badge>
        </ng-template>
      </odlq-data-table>
      <p style="font-size:12px;color:var(--ui-text-muted)">{{ selected.length }} selecionada(s)</p>`,
  }),
};

export const Vazia: Story = {
  render: () => ({
    props: { columns, rows: [] },
    template: `
      <odlq-data-table [columns]="columns" [rows]="rows">
        <odlq-empty-state empty />
      </odlq-data-table>`,
  }),
};

export const KeyValue: Story = {
  name: 'Key/value (configuração do tópico)',
  render: () => ({
    props: { rows: TOPIC_CONFIG },
    template: `<div style="border:1px solid var(--ui-border);border-radius:8px;overflow:hidden"><odlq-key-value-table [rows]="rows" caption="Topic configuration" /></div>`,
  }),
};
