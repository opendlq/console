import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { OdlqButton } from '../button/button';
import {
  CONNECTOR_CONFIG, CONNECTOR_ERROR, CONNECTOR_TASKS, DLQ_MESSAGES, PERMISSIONS, RATE_SERIES, SCHEMA_V3, SCHEMA_V4, TOPIC_CONFIG,
  TOPIC_CONFIG_RAW,
} from '../mocks';
import { OdlqAttemptTimeline, type OdlqAttempt } from './attempt-timeline';
import { OdlqBulkActionBar } from './bulk-action-bar';
import { OdlqClusterOverview } from './cluster-overview';
import { OdlqConnectorPanel } from './connector-panel';
import { OdlqFilterBar, type OdlqAppliedFilter } from './filter-bar';
import { OdlqHeaderList } from './header-list';
import { OdlqJsFilterDrawer } from './js-filter-drawer';
import { OdlqMessageDetailDrawer } from './message-detail-drawer';
import { OdlqMessageTable } from './message-table';
import { OdlqPermissionMatrix } from './permission-matrix';
import { OdlqProduceForm } from './produce-form';
import { OdlqReprocessDrawer } from './reprocess-drawer';
import { OdlqRiskCard } from './risk-card';
import { OdlqSchemaDiff } from './schema-diff';
import { OdlqStatusBadge } from './status-badge';
import { OdlqTopicConfigPanel } from './topic-config-panel';

const meta: Meta = {
  title: 'DLQ/Compostos',
  tags: ['autodocs'],
  parameters: { layout: 'padded', docs: { story: { inline: false, iframeHeight: 420 } } },
  decorators: [
    moduleMetadata({
      imports: [
        OdlqButton, OdlqStatusBadge, OdlqFilterBar, OdlqMessageTable, OdlqBulkActionBar, OdlqAttemptTimeline, OdlqHeaderList,
        OdlqMessageDetailDrawer, OdlqReprocessDrawer, OdlqJsFilterDrawer, OdlqProduceForm, OdlqTopicConfigPanel, OdlqSchemaDiff,
        OdlqConnectorPanel, OdlqRiskCard, OdlqPermissionMatrix, OdlqClusterOverview,
      ],
    }),
  ],
};
export default meta;
type Story = StoryObj;

const ATTEMPTS: OdlqAttempt[] = [
  { at: '2026-11-21 10:02:11', outcome: 'failed', message: 'java.net.SocketTimeoutException: payments-api did not respond', durationMs: 30000 },
  { at: '2026-11-21 10:07:12', outcome: 'failed', message: 'java.net.SocketTimeoutException: payments-api did not respond', durationMs: 30000 },
  { at: '2026-11-21 10:22:40', outcome: 'queued' },
];

const FILTERS: OdlqAppliedFilter[] = [
  { id: '1', kind: 'js', label: 'Paris customers' },
  { id: '2', kind: 'partitions', label: '0, 2' },
  { id: '3', kind: 'status', label: 'parked' },
];

export const Status: Story = {
  name: 'StatusBadge',
  render: () => ({
    template: `<div style="display:flex;gap:12px"><odlq-status-badge status="pending" /><odlq-status-badge status="retrying" /><odlq-status-badge status="resolved" /><odlq-status-badge status="parked" /></div>`,
  }),
};

export const FilterBar: Story = {
  render: () => ({
    props: { filters: FILTERS, templates: [{ value: 'timeouts', label: 'Timeouts last 24h' }, { value: 'parked', label: 'Parked only' }] },
    template: `<odlq-filter-bar [filters]="filters" [templates]="templates" />`,
  }),
};

export const MessageTable: Story = {
  render: () => ({
    props: { messages: DLQ_MESSAGES, selection: [DLQ_MESSAGES[0], DLQ_MESSAGES[2]] },
    template: `
      <div style="display:grid;gap:12px">
        <odlq-bulk-action-bar [count]="selection.length" />
        <odlq-message-table [messages]="messages" [(selection)]="selection" />
      </div>`,
  }),
};

export const MessageTableVazia: Story = {
  name: 'MessageTable (vazia)',
  render: () => ({ template: `<odlq-message-table [messages]="[]" />` }),
};

export const Tentativas: Story = {
  name: 'AttemptTimeline + HeaderList',
  render: () => ({
    props: { attempts: ATTEMPTS, headers: DLQ_MESSAGES[0].headers },
    template: `<div style="display:grid;gap:24px;max-width:520px"><odlq-attempt-timeline [attempts]="attempts" /><odlq-header-list [headers]="headers" /></div>`,
  }),
};

export const DetalheDaMensagem: Story = {
  name: 'MessageDetailDrawer',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    props: { open: true, message: DLQ_MESSAGES[0], attempts: ATTEMPTS },
    template: `
      <div style="padding:16px"><button odlq-button variant="outline" (click)="open = true">Open details</button></div>
      <odlq-message-detail-drawer [(open)]="open" [message]="message" [attempts]="attempts" />`,
  }),
};

export const Reprocessar: Story = {
  name: 'ReprocessDrawer',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    props: { open: true, message: DLQ_MESSAGES[0], topics: ['orders.created', 'orders.retry', 'orders.dlq'].map((t) => ({ value: t, label: t })) },
    template: `
      <div style="padding:16px"><button odlq-button variant="outline" (click)="open = true">Reprocess</button></div>
      <odlq-reprocess-drawer [(open)]="open" [message]="message" [topics]="topics" />`,
  }),
};

export const FiltroJs: Story = {
  name: 'JsFilterDrawer',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    props: { open: true },
    template: `
      <div style="padding:16px"><button odlq-button variant="outline" (click)="open = true">Add JS filter</button></div>
      <odlq-js-filter-drawer [(open)]="open" />`,
  }),
};

export const Produce: Story = {
  name: 'ProduceForm',
  parameters: { docs: { story: { inline: false, iframeHeight: 700 } } },
  render: () => ({ template: `<div style="max-width:720px"><odlq-produce-form /></div>` }),
};

export const Config: Story = {
  name: 'TopicConfigPanel',
  parameters: { docs: { story: { inline: false, iframeHeight: 560 } } },
  render: () => ({ props: { rows: TOPIC_CONFIG, raw: TOPIC_CONFIG_RAW }, template: `<odlq-topic-config-panel [rows]="rows" [raw]="raw" />` }),
};

export const Schema: Story = {
  name: 'SchemaDiff',
  parameters: { docs: { story: { inline: false, iframeHeight: 560 } } },
  render: () => ({
    props: { versions: [{ label: 'v3 · ID 100042', schema: SCHEMA_V3 }, { label: 'v4 · ID 100057', schema: SCHEMA_V4 }] },
    template: `<odlq-schema-diff [versions]="versions" />`,
  }),
};

export const Conector: Story = {
  name: 'ConnectorPanel',
  parameters: { docs: { story: { inline: false, iframeHeight: 760 } } },
  render: () => ({
    props: { config: CONNECTOR_CONFIG, error: CONNECTOR_ERROR, tasks: CONNECTOR_TASKS },
    template: `<odlq-connector-panel name="dlq-s3-sink" state="FAILED" [(config)]="config" [error]="error" [tasks]="tasks" />`,
  }),
};

export const Risco: Story = {
  name: 'RiskCard',
  render: () => ({
    props: {
      items: [{ name: 'payments.dlq', value: '12.4K' }, { name: 'orders.dlq', value: '8.1K' }, { name: 'shipping.dlq', value: '2.3K' }],
    },
    template: `
      <div style="display:grid;gap:16px;grid-template-columns:repeat(3,minmax(0,1fr))">
        <odlq-risk-card heading="Parked messages" metric="22.8K" hint="across 6 topics" [percent]="82" badge="High" [items]="items" />
        <odlq-risk-card heading="Retry rate" metric="14%" hint="of all dead letters" [percent]="48" badge="Medium" />
        <odlq-risk-card heading="Drained (24h)" metric="96%" hint="reprocessed successfully" [percent]="12" badge="Low" />
      </div>`,
  }),
};

export const Permissoes: Story = {
  name: 'PermissionMatrix',
  parameters: { docs: { story: { inline: false, iframeHeight: 640 } } },
  render: () => ({ props: { rows: PERMISSIONS }, template: `<div style="max-width:640px"><odlq-permission-matrix [rows]="rows" /></div>` }),
};

export const Cluster: Story = {
  name: 'ClusterOverview',
  parameters: { docs: { story: { inline: false, iframeHeight: 640 } } },
  render: () => ({
    props: {
      categories: RATE_SERIES.categories,
      produce: [{ name: 'Produce', values: RATE_SERIES.produce, color: 'var(--ui-info)' }],
      consume: [{ name: 'Consume', values: RATE_SERIES.consume, color: 'var(--ui-info)' }],
      recent: [
        { name: 'orders.dlq', kind: 'Topic', icon: 'topics' },
        { name: 'dlq-s3-sink', kind: 'Connector', icon: 'connect' },
        { name: 'orders-consumer', kind: 'Consumer group', icon: 'consumer-groups' },
      ],
    },
    template: `<odlq-cluster-overview [topics]="248" [produce]="produce" [consume]="consume" [categories]="categories" [recent]="recent" />`,
  }),
};
