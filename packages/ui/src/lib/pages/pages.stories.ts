import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { OdlqButton } from '../button/button';
import { OdlqCard } from '../card/card';
import type { OdlqSeries } from '../charts/chart-utils';
import { OdlqBarChart } from '../charts/bar-chart';
import { OdlqChartLegend } from '../charts/legend';
import { OdlqLineChart } from '../charts/line-chart';
import { OdlqCellDef, OdlqDataTable, type OdlqColumn } from '../data-table/data-table';
import { OdlqAttemptTimeline } from '../dlq/attempt-timeline';
import { OdlqBulkActionBar } from '../dlq/bulk-action-bar';
import { OdlqClusterOverview } from '../dlq/cluster-overview';
import { OdlqConnectorPanel } from '../dlq/connector-panel';
import { OdlqFilterBar, type OdlqAppliedFilter } from '../dlq/filter-bar';
import { OdlqJsFilterDrawer } from '../dlq/js-filter-drawer';
import { OdlqMessageDetailDrawer } from '../dlq/message-detail-drawer';
import { OdlqMessageTable } from '../dlq/message-table';
import { OdlqPermissionMatrix } from '../dlq/permission-matrix';
import { OdlqProduceForm } from '../dlq/produce-form';
import { OdlqReprocessDrawer } from '../dlq/reprocess-drawer';
import { OdlqRiskCard } from '../dlq/risk-card';
import { OdlqSchemaDiff } from '../dlq/schema-diff';
import { OdlqTopicConfigPanel } from '../dlq/topic-config-panel';
import { OdlqBadge } from '../badge/badge';
import { OdlqInlineStats, OdlqKpiCard, OdlqKpiRow } from '../kpi/kpi';
import { OdlqPagination } from '../pagination/pagination';
import { OdlqSegmentedControl } from '../segmented-control/segmented-control';
import { OdlqToaster } from '../toast/toast';
import {
  CHARGEBACK, CONNECTOR_CONFIG, CONNECTOR_ERROR, CONNECTOR_TASKS, DLQ_MESSAGES, PERMISSIONS, RATE_SERIES, SCHEMA_V3, SCHEMA_V4,
  TOPIC_CONFIG, TOPIC_CONFIG_RAW,
} from '../mocks';
import { OdlqDemoFrame, TOPIC_TABS } from './demo-frame';

const meta: Meta = {
  title: 'Páginas/Console',
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, iframeHeight: 860 } } },
  decorators: [
    moduleMetadata({
      imports: [
        OdlqDemoFrame, OdlqButton, OdlqCard, OdlqBarChart, OdlqLineChart, OdlqChartLegend, OdlqDataTable, OdlqCellDef, OdlqBadge,
        OdlqBulkActionBar, OdlqClusterOverview, OdlqConnectorPanel, OdlqFilterBar, OdlqJsFilterDrawer, OdlqMessageDetailDrawer,
        OdlqMessageTable, OdlqPermissionMatrix, OdlqProduceForm, OdlqReprocessDrawer, OdlqRiskCard, OdlqSchemaDiff,
        OdlqTopicConfigPanel, OdlqKpiRow, OdlqKpiCard, OdlqInlineStats, OdlqPagination, OdlqSegmentedControl, OdlqToaster,
        OdlqAttemptTimeline,
      ],
    }),
  ],
};
export default meta;
type Story = StoryObj;

const TOPIC = { title: 'payments.dlq', crumbs: [{ label: 'Topics' }], tabs: TOPIC_TABS };
const TOPICS = ['payments.transactions', 'orders.created', 'users.registrations'].map((t) => ({ value: t, label: t }));
const FILTERS: OdlqAppliedFilter[] = [
  { id: 'js', kind: 'js', label: 'Paris customers' },
  { id: 'p', kind: 'partitions', label: '0, 2' },
  { id: 's', kind: 'status', label: 'parked' },
];

const consume = (extra: Record<string, unknown> = {}, messages = 'messages') => ({
  props: { ...TOPIC, tab: 'consume', messages: DLQ_MESSAGES, filters: FILTERS, selection: [], selected: null, detail: false, jsOpen: false, reprocessing: false, topics: TOPICS, ...extra },
  template: `
    <odlq-demo-frame active="topics" [title]="title" [crumbs]="crumbs" [tabs]="tabs" [(tab)]="tab">
      <button actions odlq-button variant="outline">Actions</button>
      <div style="display:grid;gap:16px">
        <odlq-kpi-row>
          <odlq-kpi-card label="Dead letters" value="22.8K" hint="+1.2K today" />
          <odlq-kpi-card label="Parked" value="1.4K" tone="danger" hint="needs manual action" />
          <odlq-kpi-card label="Retrying" value="318" tone="warning" />
          <odlq-kpi-card label="Resolved (24h)" value="9.6K" tone="success" />
        </odlq-kpi-row>
        <odlq-filter-bar [filters]="filters" (addJsFilter)="jsOpen = true" (filterRemoved)="filters = filters.filter(f => f.id !== $event)" (clearAll)="filters = []" />
        <odlq-bulk-action-bar [count]="selection.length" (reprocess)="reprocessing = true" (cleared)="selection = []" />
        <odlq-message-table [messages]="${messages}" [(selection)]="selection" [activeMessage]="selected" (messageClick)="selected = $event; detail = true" />
        <odlq-pagination [total]="${messages}.length ? 260 : 0" [pageSize]="50" />
      </div>
      <odlq-message-detail-drawer [(open)]="detail" [message]="selected" placement="container" (reprocess)="detail = false; reprocessing = true" />
      <odlq-js-filter-drawer [(open)]="jsOpen" placement="container" />
      <odlq-reprocess-drawer [(open)]="reprocessing" [message]="selection[0] ?? selected" [topics]="topics" placement="container" />
    </odlq-demo-frame>`,
});

export const TopicsConsume: Story = { name: 'Topics · Consume', render: () => consume() };

export const TopicsConsumeEscuro: Story = {
  name: 'Topics · Consume (escuro)',
  globals: { theme: 'dark' },
  render: () => consume({ selection: [DLQ_MESSAGES[0], DLQ_MESSAGES[2]] }),
};

export const TopicsConsumeDetalhe: Story = {
  name: 'Topics · Consume + detalhe da mensagem',
  render: () => consume({ selected: DLQ_MESSAGES[0], detail: true }),
};

export const TopicsConsumeReprocess: Story = {
  name: 'Topics · Reprocess message',
  render: () => consume({ selected: DLQ_MESSAGES[0], reprocessing: true }),
};

export const TopicsVazio: Story = {
  name: 'Topics · Empty state',
  render: () => consume({ messages: [] }),
};

export const Produce: Story = {
  render: () => ({
    props: { ...TOPIC, title: 'orders.created', tab: 'produce' },
    template: `
      <odlq-demo-frame active="topics" [title]="title" [crumbs]="crumbs" [tabs]="tabs" [(tab)]="tab">
        <div style="max-width:820px"><odlq-produce-form /></div>
      </odlq-demo-frame>`,
  }),
};

export const Configuration: Story = {
  render: () => ({
    props: { ...TOPIC, tab: 'config', rows: TOPIC_CONFIG, raw: TOPIC_CONFIG_RAW },
    template: `
      <odlq-demo-frame active="topics" [title]="title" [crumbs]="crumbs" [tabs]="tabs" [(tab)]="tab">
        <button actions odlq-button variant="outline">Edit config</button>
        <odlq-topic-config-panel [rows]="rows" [raw]="raw" />
      </odlq-demo-frame>`,
  }),
};

export const SchemaDiff: Story = {
  name: 'Schema diff',
  render: () => ({
    props: { ...TOPIC, tab: 'schema', versions: [{ label: 'v3 · ID 100042', schema: SCHEMA_V3 }, { label: 'v4 · ID 100057', schema: SCHEMA_V4 }] },
    template: `
      <odlq-demo-frame active="topics" [title]="title" [crumbs]="crumbs" [tabs]="tabs" [(tab)]="tab">
        <odlq-schema-diff [versions]="versions" />
      </odlq-demo-frame>`,
  }),
};

export const KafkaConnect: Story = {
  name: 'Kafka Connect',
  render: () => ({
    props: { config: CONNECTOR_CONFIG, error: CONNECTOR_ERROR, tasks: CONNECTOR_TASKS },
    template: `
      <odlq-demo-frame active="connect" title="dlq-s3-sink" [crumbs]="[{ label: 'Kafka Connect' }]">
        <odlq-connector-panel name="dlq-s3-sink" state="FAILED" [(config)]="config" [error]="error" [tasks]="tasks" />
      </odlq-demo-frame>`,
  }),
};

export const Home: Story = {
  render: () => ({
    props: {
      categories: RATE_SERIES.categories,
      produce: [{ name: 'Produce', values: RATE_SERIES.produce, color: 'var(--ui-info)' }],
      consume: [{ name: 'Consume', values: RATE_SERIES.consume, color: 'var(--ui-info)' }],
      recent: [
        { name: 'payments.dlq', kind: 'Topic', icon: 'topics' },
        { name: 'dlq-s3-sink', kind: 'Connector', icon: 'connect' },
        { name: 'orders-consumer', kind: 'Consumer group', icon: 'consumer-groups' },
      ],
    },
    template: `
      <odlq-demo-frame active="home" title="Home">
        <odlq-cluster-overview [topics]="248" [produce]="produce" [consume]="consume" [categories]="categories" [recent]="recent" />
      </odlq-demo-frame>`,
  }),
};

export const Insights: Story = {
  render: () => ({
    props: {
      top: [{ name: 'payments.dlq', value: '12.4K' }, { name: 'orders.dlq', value: '8.1K' }, { name: 'shipping.dlq', value: '2.3K' }],
    },
    template: `
      <odlq-demo-frame active="insights" title="Insights">
        <div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">
          <odlq-risk-card heading="Parked messages" metric="22.8K" hint="across 6 topics" [percent]="82" badge="High" [items]="top" />
          <odlq-risk-card heading="Oldest unprocessed" metric="9d" hint="payments.dlq" [percent]="64" badge="Medium" />
          <odlq-risk-card heading="Retry exhaustion" metric="14%" hint="of dead letters" [percent]="48" badge="Medium" />
          <odlq-risk-card heading="Schema mismatches" metric="318" hint="last 24h" [percent]="22" badge="Low" />
          <odlq-risk-card heading="Unmonitored DLQs" metric="4" hint="no alert configured" [percent]="78" badge="High" />
          <odlq-risk-card heading="Drained (24h)" metric="96%" hint="reprocessed successfully" [percent]="8" badge="Low" />
        </div>
      </odlq-demo-frame>`,
  }),
};

export const Permissions: Story = {
  render: () => ({
    props: { rows: PERMISSIONS, tabs: [{ value: 'members', label: 'Members', count: 12 }, { value: 'permissions', label: 'Permissions' }], tab: 'permissions' },
    template: `
      <odlq-demo-frame active="permissions" title="data-engineers" [crumbs]="[{ label: 'Groups' }]" [tabs]="tabs" [(tab)]="tab">
        <div style="max-width:720px"><odlq-permission-matrix [rows]="rows" (save)="rows = $event" /></div>
      </odlq-demo-frame>`,
  }),
};

export const Chargeback: Story = {
  render: () => ({
    props: {
      range: '30D',
      ranges: ['7D', '30D', '90D'].map((r) => ({ value: r, label: r })),
      categories: CHARGEBACK.categories,
      series: CHARGEBACK.series,
      fmt: (n: number) => '$' + n.toFixed(1) + 'K',
    },
    template: `
      <odlq-demo-frame active="chargeback" title="Chargeback">
        <div style="display:grid;gap:16px">
          <odlq-kpi-row>
            <odlq-kpi-card label="Total cost" value="$118.4K" hint="last 30 days" />
            <odlq-kpi-card label="Producers" value="14" />
            <odlq-kpi-card label="Consumers" value="31" />
          </odlq-kpi-row>
          <odlq-card heading="Key metrics">
            <odlq-segmented-control actions [options]="ranges" [(value)]="range" size="sm" label="Range" />
            <odlq-chart-legend [series]="series" [max]="4" style="margin-bottom:12px" />
            <odlq-bar-chart [categories]="categories" [series]="series" [stacked]="true" [height]="280" [yFormat]="fmt" label="Cost per service account" />
          </odlq-card>
        </div>
      </odlq-demo-frame>`,
  }),
};

const MEMBERS: { id: string; host: string; partitions: string; lag: number }[] = [
  { id: 'orders-consumer-7f9c', host: '10.0.3.12', partitions: 'orders.created [0, 1]', lag: 4210 },
  { id: 'orders-consumer-2a81', host: '10.0.3.27', partitions: 'orders.created [2, 3]', lag: 3987 },
  { id: 'orders-consumer-b410', host: '10.0.4.5', partitions: 'orders.retry [0, 1]', lag: 2104 },
  { id: 'orders-consumer-c3d2', host: '10.0.4.9', partitions: 'orders.retry [2, 3]', lag: 2101 },
];
const MEMBER_COLUMNS: OdlqColumn[] = [
  { key: 'id', header: 'Member', mono: true, sortable: true },
  { key: 'host', header: 'Host', mono: true },
  { key: 'partitions', header: 'Assigned partitions', mono: true },
  { key: 'lag', header: 'Lag', mono: true, align: 'end', sortable: true },
];
const LAG: OdlqSeries[] = [
  { name: 'orders.created', values: [820, 940, 1300, 2100, 3400, 5200, 6100, 7400, 8200, 8197], color: 'var(--ui-chart-1)' },
  { name: 'orders.retry', values: [200, 260, 420, 800, 1500, 2600, 3400, 4100, 4205, 4205], color: 'var(--ui-chart-3)' },
];

export const ConsumerGroup: Story = {
  name: 'Consumer group',
  render: () => ({
    props: {
      members: MEMBERS,
      columns: MEMBER_COLUMNS,
      lag: LAG,
      categories: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
      stats: [
        { label: 'State', value: 'Stable', badge: 'success' },
        { label: 'Members', value: 4 },
        { label: 'Total lag', value: '12.4K' },
        { label: 'Consume rate', value: '3.8K msg/s' },
      ],
    },
    template: `
      <odlq-demo-frame active="groups" title="orders-consumer" [crumbs]="[{ label: 'Consumer Groups' }]">
        <div style="display:grid;gap:16px">
          <odlq-inline-stats [items]="stats" />
          <odlq-card heading="Offset lag per topic">
            <odlq-chart-legend [series]="lag" style="margin-bottom:12px" />
            <odlq-line-chart [series]="lag" [categories]="categories" [height]="220" label="Offset lag" />
          </odlq-card>
          <odlq-card heading="Members" [flush]="true">
            <odlq-data-table [columns]="columns" [rows]="members" density="compact" caption="Group members" />
          </odlq-card>
        </div>
      </odlq-demo-frame>`,
  }),
};
