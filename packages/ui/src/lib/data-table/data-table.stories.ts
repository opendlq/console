import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { OdlqBadge } from '../badge/badge';
import { OdlqButton } from '../button/button';
import { OdlqEmptyState } from '../empty-state/empty-state';
import messages from '../dlq/__fixtures__/failure-messages.json';
import { STATES, type DlqMessage } from '../domain';
import { OdlqCellDef, OdlqDataTable, type OdlqColumn } from './data-table';
import { OdlqKeyValueTable, type OdlqKeyValue } from './key-value-table';

const DLQ_MESSAGES = messages as DlqMessage[];

const columns: OdlqColumn<DlqMessage>[] = [
  { key: 'receivedAt', header: 'Received', sortable: true, mono: true },
  { key: 'consumer', header: 'Consumer', sortable: true },
  { key: 'partitionKey', header: 'Key', mono: true },
  { key: 'reason', header: 'Reason' },
  { key: 'attempts', header: 'Attempts', align: 'end', mono: true, accessor: (m) => m.attempts.length },
  { key: 'state', header: 'State' },
];

/** Valores efetivos de uma `Policy` (config declarativa, somente leitura). */
const POLICY: OdlqKeyValue[] = [
  { key: 'retry.max', value: 5, info: 'Attempts before a transient failure is treated as permanent.' },
  { key: 'retry.base', value: '30s', info: 'First backoff delay. Multiplied by the factor on each attempt.', overridden: true },
  { key: 'retry.factor', value: 2, info: 'Backoff multiplier.' },
  { key: 'retry.cap', value: '30m', info: 'Largest delay between two attempts.' },
  { key: 'breaker.threshold', value: 20, info: 'Distinct transient failures on one dependency that open the circuit.', overridden: true },
  { key: 'breaker.window', value: '60s', info: 'Window in which the failures are counted.' },
  { key: 'drain.rate', value: '50 msg/s', info: 'Rate at which the held backlog drains after the circuit closes.' },
  { key: 'recovery.mode', value: 'ack', info: 'ack: the consumer confirms. silence: no return to the DLQ counts as recovered.' },
  { key: 'ttl', value: '72h', info: 'Open messages expire after this time.' },
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
    template: `<odlq-data-table [columns]="columns" [rows]="rows" [density]="density" caption="Failed messages" />`,
  }),
};
export default meta;
type Story = StoryObj<OdlqDataTable<DlqMessage>>;

export const Basica: Story = { name: 'Básica (ordenável)' };

export const SelecaoECelulas: Story = {
  name: 'Seleção + células customizadas',
  render: () => ({
    props: { columns, rows: DLQ_MESSAGES.slice(0, 8), selected: [] as DlqMessage[], tones: Object.fromEntries(Object.entries(STATES).map(([k, v]) => [k, v.tone])) },
    template: `
      <odlq-data-table [columns]="columns" [rows]="rows" [selectable]="true" [(selection)]="selected" [clickable]="true" caption="Failed messages">
        <ng-template odlqCell="state" let-row>
          <odlq-badge mono [dot]="true" [tone]="tones[row.state]">{{ row.state }}</odlq-badge>
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
  name: 'Key/value (Policy efetiva)',
  render: () => ({
    props: { rows: POLICY },
    template: `<div style="border:1px solid var(--ui-border);border-radius:8px;overflow:hidden"><odlq-key-value-table [rows]="rows" keyHeader="Field" caption="Policy" /></div>`,
  }),
};
