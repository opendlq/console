import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { OdlqAlert } from '../alert/alert';
import { OdlqBadge } from '../badge/badge';
import { OdlqButton } from '../button/button';
import { OdlqCard } from '../card/card';
import { OdlqBarChart } from '../charts/bar-chart';
import { OdlqChartLegend } from '../charts/legend';
import { OdlqLineChart } from '../charts/line-chart';
import { OdlqSparkline } from '../charts/sparkline';
import { OdlqCodeBlock } from '../code/code-block';
import { OdlqCellDef, OdlqDataTable, type OdlqColumn } from '../data-table/data-table';
import { OdlqKeyValueTable, type OdlqKeyValue } from '../data-table/key-value-table';
import { OdlqAuditLog } from '../dlq/audit-log';
import { OdlqBreakerCard } from '../dlq/breaker-card';
import { OdlqBulkActionBar } from '../dlq/bulk-action-bar';
import alertInstances from '../dlq/__fixtures__/alert-instances.json';
import alertRules from '../dlq/__fixtures__/alert-rules.json';
import auditLog from '../dlq/__fixtures__/audit-log.json';
import breakers from '../dlq/__fixtures__/breakers.json';
import resources from '../dlq/__fixtures__/config-resources.json';
import COST from '../dlq/__fixtures__/cost.json';
import messages from '../dlq/__fixtures__/failure-messages.json';
import findings from '../dlq/__fixtures__/findings.json';
import INFLOW from '../dlq/__fixtures__/inflow.json';
import policy from '../dlq/__fixtures__/policy.json';
import RECURRENCE from '../dlq/__fixtures__/recurrence.json';
import runbooks from '../dlq/__fixtures__/runbooks.json';
import { OdlqFilterBar } from '../dlq/filter-bar';
import { OdlqFunnel } from '../dlq/funnel';
import { OdlqGroupTable } from '../dlq/group-table';
import { OdlqKindBadge } from '../dlq/kind-badge';
import { OdlqLogExtract } from '../dlq/log-extract';
import { OdlqMessageDetailDrawer } from '../dlq/message-detail-drawer';
import { OdlqMessageTable } from '../dlq/message-table';
import { OdlqReclassifyDialog } from '../dlq/reclassify-dialog';
import { OdlqReplayDrawer } from '../dlq/replay-drawer';
import { OdlqRunbookCard } from '../dlq/runbook-card';
import { OdlqStateBadge } from '../dlq/state-badge';
import { OdlqStateStrip } from '../dlq/state-strip';
import {
  OPEN_STATES, formatAge, funnel, groupMessages, isOpen, messageHistory, selfRecoveryRate,
  type AlertInstance, type AlertRule, type Breaker, type ConfigResource, type DlqMessage, type Finding, type Runbook, type Transition,
} from '../domain';
import { OdlqInlineStats, OdlqKpiCard, OdlqKpiRow } from '../kpi/kpi';
import { OdlqPagination } from '../pagination/pagination';
import { OdlqSegmentedControl } from '../segmented-control/segmented-control';
import { OdlqSelect } from '../select/select';
import { OdlqToaster } from '../toast/toast';
import { OdlqDemoFrame } from './demo-frame';

const meta: Meta = {
  title: 'Páginas/Console',
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, iframeHeight: 860 } } },
  decorators: [
    moduleMetadata({
      imports: [
        OdlqDemoFrame, OdlqAlert, OdlqBadge, OdlqButton, OdlqCard, OdlqBarChart, OdlqChartLegend, OdlqLineChart, OdlqSparkline, OdlqCodeBlock,
        OdlqDataTable, OdlqCellDef, OdlqKeyValueTable, OdlqAuditLog, OdlqBreakerCard, OdlqBulkActionBar, OdlqFilterBar, OdlqFunnel, OdlqGroupTable,
        OdlqKindBadge, OdlqLogExtract, OdlqMessageDetailDrawer, OdlqMessageTable, OdlqReclassifyDialog, OdlqReplayDrawer, OdlqRunbookCard,
        OdlqStateBadge, OdlqStateStrip, OdlqInlineStats, OdlqKpiCard, OdlqKpiRow, OdlqPagination, OdlqSegmentedControl, OdlqSelect, OdlqToaster,
      ],
    }),
  ],
};
export default meta;
type Story = StoryObj;

const DLQ_MESSAGES = messages as DlqMessage[];
const FAILURE_GROUPS = groupMessages(DLQ_MESSAGES);
const FUNNEL = funnel(DLQ_MESSAGES);
const AUDIT_LOG = auditLog as Transition[];
const BREAKERS = breakers as Breaker[];
const RUNBOOKS = runbooks as Runbook[];
const ALERT_RULES = alertRules as AlertRule[];
const ALERT_INSTANCES = alertInstances as AlertInstance[];
const FINDINGS = findings as Finding[];
const RESOURCES = resources as ConfigResource[];
const POLICY = policy as OdlqKeyValue[];
const OPEN = DLQ_MESSAGES.filter((m) => isOpen(m.state));
const COUNTS = Object.fromEntries(OPEN_STATES.map((s) => [s, OPEN.filter((m) => m.state === s).length]));
/** Mensagens em `held` por dependência, na ordem dos breakers. */
const HELD = BREAKERS.map((b) => DLQ_MESSAGES.filter((m) => m.state === 'held' && m.dependency === b.dependency).length);
const MAX_AGE = formatAge(Math.max(...OPEN.map((m) => m.ageMin)));
const option = (v: string) => ({ value: v, label: v });
const GROUP = FAILURE_GROUPS.find((g) => g.key === 'schema-amount-type')!;
const GROUP_MESSAGES = OPEN.filter((m) => m.groupKey === GROUP.key);
const COLUMNS_FLOW = [
  { name: 'In', values: INFLOW.in, color: 'var(--ui-danger)' },
  { name: 'Out', values: INFLOW.out, color: 'var(--ui-success-solid)' },
];

/* ───────────── Overview ───────────── */

const overview = () => ({
  props: {
    open: OPEN.length,
    groups: FAILURE_GROUPS.length,
    waiting: COUNTS['awaiting_operator'],
    maxAge: MAX_AGE,
    self: selfRecoveryRate(FUNNEL),
    counts: COUNTS,
    funnel: FUNNEL,
    flow: COLUMNS_FLOW,
    categories: INFLOW.categories,
    breakers: BREAKERS.filter((b) => b.state !== 'closed'),
    held: Object.fromEntries(BREAKERS.map((b, i) => [b.dependency, HELD[i]])) as Record<string, number>,
  },
  template: `
    <odlq-demo-frame active="overview" title="Overview">
      <div style="display:grid;gap:20px">
        <odlq-alert tone="warning" heading="Circuit open: inventory-service">
          {{ held['inventory-service'] }} messages are held while the dependency is down. The next probe runs in 45s; the backlog then drains at 50 msg/s.
        </odlq-alert>
        <odlq-kpi-row>
          <odlq-kpi-card label="Open messages" [value]="open" [hint]="'across ' + groups + ' causes'" />
          <odlq-kpi-card label="Waiting for an operator" [value]="waiting" tone="danger" hint="permanent, needs a decision" />
          <odlq-kpi-card label="Max age" [value]="maxAge" tone="warning" hint="oldest open message" />
          <odlq-kpi-card label="Self-recovery" [value]="self + '%'" tone="success" hint="closed without a human" />
        </odlq-kpi-row>
        <odlq-state-strip [counts]="counts" />
        <div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(380px,1fr))">
          <odlq-card heading="Resolution funnel"><odlq-funnel [rows]="funnel" /></odlq-card>
          <odlq-card heading="Inflow vs. outflow">
            <odlq-chart-legend [series]="flow" style="margin-bottom:12px" />
            <odlq-line-chart [series]="flow" [categories]="categories" unit="msg" [area]="true" label="Messages in and out of the DLQ per hour" />
          </odlq-card>
        </div>
        <section>
          <h2 style="margin:0 0 12px;font-size:var(--ui-text-xl)">Circuits that need attention</h2>
          <div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">
            @for (b of breakers; track b.dependency) { <odlq-breaker-card [breaker]="b" [held]="held[b.dependency]" /> }
          </div>
        </section>
      </div>
    </odlq-demo-frame>`,
});

export const Overview: Story = { render: overview };
export const OverviewEscuro: Story = { name: 'Overview (escuro)', globals: { theme: 'dark' }, render: overview };

/* ───────────── Failures (por causa) ───────────── */

const failures = (extra: Record<string, unknown> = {}) => ({
  props: {
    counts: COUNTS,
    state: null,
    query: '',
    consumers: ['order-events', 'payment-events', 'user-events'].map(option),
    kinds: ['transient', 'permanent', 'unknown'].map(option),
    consumer: null,
    kind: null,
    groups: FAILURE_GROUPS,
    selection: [],
    ...extra,
  },
  template: `
    <odlq-demo-frame active="failures" title="Failures">
      <div style="display:grid;gap:16px">
        <odlq-state-strip [counts]="counts" [(selected)]="state" />
        <odlq-filter-bar [(query)]="query" [active]="!!(consumer || kind || state)" placeholder="Search by cause, reason or dependency…">
          <odlq-select [options]="consumers" [(value)]="consumer" prefix="Consumer:" placeholder="All" label="Consumer" />
          <odlq-select [options]="kinds" [(value)]="kind" prefix="Kind:" placeholder="All" label="Kind" />
        </odlq-filter-bar>
        <odlq-bulk-action-bar [count]="selection.length" noun="cause(s)" [editable]="false" />
        <odlq-group-table [groups]="groups" [(selection)]="selection" />
      </div>
    </odlq-demo-frame>`,
});

export const Failures: Story = { render: () => failures() };
export const FailuresSelecao: Story = {
  name: 'Failures (causas selecionadas, escuro)',
  globals: { theme: 'dark' },
  render: () => failures({ selection: [FAILURE_GROUPS[0], FAILURE_GROUPS[2]] }),
};
export const FailuresVazio: Story = { name: 'Failures (vazio)', render: () => failures({ groups: [], query: 'nothing' }) };

/* ───────────── Uma causa ───────────── */

const group = (extra: Record<string, unknown> = {}) => ({
  props: {
    g: GROUP,
    stats: [
      { label: 'Kind', value: GROUP.kind, badge: 'danger' },
      { label: 'Consumer', value: GROUP.consumer },
      { label: 'Dependency', value: GROUP.dependency ?? '—' },
      { label: 'Classified by', value: GROUP.classifiedBy },
      { label: 'Group', value: GROUP.key },
    ],
    age: formatAge(GROUP.oldestMin),
    enrichment: GROUP_MESSAGES[0].enrichment,
    messages: GROUP_MESSAGES,
    targets: ['payments.transactions', 'payments.manual-review'].map(option),
    query: '',
    selection: [],
    selected: null,
    history: [],
    inspect: false,
    replay: false,
    edit: false,
    reclassify: false,
    ...extra,
  },
  template: `
    <odlq-demo-frame active="failures" [title]="g.reason" [crumbs]="[{ label: 'Failures' }]">
      <div actions style="display:flex;gap:8px">
        <button odlq-button variant="outline">Reclassify all</button>
        <button odlq-button variant="primary">Replay all {{ g.count }}</button>
      </div>
      <div style="display:grid;gap:16px">
        <odlq-inline-stats [items]="stats" />
        <odlq-kpi-row>
          <odlq-kpi-card label="Open messages" [value]="g.count" tone="danger" />
          <odlq-kpi-card label="Oldest" [value]="age" tone="warning" />
          <odlq-kpi-card label="Arrivals · last 12h"><odlq-sparkline [values]="g.trend" [width]="160" [height]="32" label="Arrivals per hour" /></odlq-kpi-card>
        </odlq-kpi-row>
        <odlq-alert tone="info" heading="No runbook covers this cause">
          Replay, edit or discard to resolve it. After the same action is applied to this cause 3 times, OpenDLQ suggests a runbook.
        </odlq-alert>
        <odlq-card heading="Correlated logs"><odlq-log-extract [enrichment]="enrichment" /></odlq-card>
        <odlq-filter-bar [(query)]="query" placeholder="Search by key, id or payload…" />
        <odlq-bulk-action-bar [count]="selection.length" />
        <odlq-message-table [messages]="messages" [(selection)]="selection" [activeMessage]="selected" (messageClick)="selected = $event; inspect = true" />
        <odlq-pagination [total]="g.count" [pageSize]="50" />
      </div>
      <odlq-message-detail-drawer [(open)]="inspect" [message]="selected" [history]="history" placement="container" />
      <odlq-replay-drawer [(open)]="replay" [messages]="messages.slice(0, 12)" [targets]="targets" placement="container" />
      <odlq-replay-drawer [(open)]="edit" [messages]="[messages[0]]" [targets]="targets" [edit]="true" placement="container" />
      <odlq-reclassify-dialog [(open)]="reclassify" [count]="g.count" noun="messages" [current]="g.kind" />
    </odlq-demo-frame>`,
});

export const Group: Story = { name: 'Failure · uma causa', render: () => group() };
export const GroupEscuro: Story = {
  name: 'Failure · uma causa (escuro, 2 selecionadas)',
  globals: { theme: 'dark' },
  render: () => group({ selection: GROUP_MESSAGES.slice(0, 2) }),
};
export const GroupInspetor: Story = {
  name: 'Failure · inspetor da mensagem',
  render: () => group({ selected: GROUP_MESSAGES[0], inspect: true, history: messageHistory(GROUP_MESSAGES[0]).reverse() }),
};
export const GroupReplay: Story = { name: 'Failure · replay em lote', render: () => group({ replay: true }) };
export const GroupEditar: Story = { name: 'Failure · editar e reenviar', render: () => group({ selected: GROUP_MESSAGES[0], edit: true }) };
export const GroupReclassificar: Story = { name: 'Failure · reclassificar', render: () => group({ reclassify: true }) };

/* ───────────── Recovery ───────────── */


export const Recovery: Story = {
  render: () => ({
    props: { breakers: BREAKERS, held: HELD, policy: POLICY },
    template: `
      <odlq-demo-frame active="recovery" title="Recovery">
        <div style="display:grid;gap:20px">
          <odlq-alert tone="info" heading="Declared in files">
            Retry, breaker, probe and drain come from <code>Policy</code> resources. This view is read-only: change them with <code>opendlq apply</code>.
          </odlq-alert>
          <div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">
            @for (b of breakers; track b.dependency; let i = $index) { <odlq-breaker-card [breaker]="b" [held]="held[i]" /> }
          </div>
          <odlq-card heading="Policy · order-events" [flush]="true">
            <odlq-key-value-table [rows]="policy" keyHeader="Field" caption="Effective policy" />
          </odlq-card>
        </div>
      </odlq-demo-frame>`,
  }),
};

/* ───────────── Runbooks ───────────── */

export const Runbooks: Story = {
  render: () => ({
    props: {
      runbooks: RUNBOOKS,
      pending: RUNBOOKS.map((r) => OPEN.filter((m) => m.runbook === r.name && m.state === 'awaiting_approval').length),
      expiring: RUNBOOKS.filter((r) => r.status !== 'expired' && r.daysLeft < 30),
    },
    template: `
      <odlq-demo-frame active="runbooks" title="Runbooks">
        <div style="display:grid;gap:20px">
          @for (r of expiring; track r.name) {
            <odlq-alert tone="warning" heading="Runbook expiring: {{ r.name }}">
              It stops on {{ r.expires }}. Renew it, or fix the root cause so the failures stop coming back.
            </odlq-alert>
          }
          <odlq-kpi-row>
            <odlq-kpi-card label="Automatic" value="1" tone="success" />
            <odlq-kpi-card label="Supervised" value="2" tone="warning" hint="waiting for approvals" />
            <odlq-kpi-card label="Suggested" value="1" tone="primary" hint="same action applied 3 times" />
            <odlq-kpi-card label="Expired" value="1" tone="danger" />
          </odlq-kpi-row>
          <div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(380px,1fr))">
            @for (r of runbooks; track r.name; let i = $index) { <odlq-runbook-card [runbook]="r" [pending]="pending[i]" /> }
          </div>
        </div>
      </odlq-demo-frame>`,
  }),
};

/* ───────────── Insights ───────────── */

const RECURRENCE_COLUMNS: OdlqColumn[] = [
  { key: 'cause', header: 'Cause', mono: true, sortable: true },
  { key: 'episodes', header: 'Episodes', mono: true, align: 'end', sortable: true },
  { key: 'last', header: 'Last seen', mono: true },
  { key: 'cost', header: 'Cost (USD)', mono: true, align: 'end', sortable: true },
  { key: 'trend', header: 'Trend' },
];
const FINDING_COLUMNS: OdlqColumn[] = [
  { key: 'detector', header: 'Detector', mono: true },
  { key: 'subject', header: 'Subject', mono: true },
  { key: 'observed', header: 'Observed', mono: true },
  { key: 'expected', header: 'Expected', mono: true },
  { key: 'score', header: 'Score', mono: true, align: 'end', accessor: (f) => (f.score ? `${f.score}σ` : '—') },
  { key: 'window', header: 'Window', mono: true },
  { key: 'status', header: 'Status' },
];

export const Insights: Story = {
  render: () => ({
    props: {
      range: '7D',
      ranges: ['1D', '7D', '30D'].map(option),
      funnel: FUNNEL,
      categories: COST.categories,
      series: COST.series,
      fmt: (n: number) => '$' + n,
      recurrence: RECURRENCE,
      recurrenceColumns: RECURRENCE_COLUMNS,
      findings: FINDINGS,
      findingColumns: FINDING_COLUMNS,
      self: selfRecoveryRate(FUNNEL),
      maxAge: MAX_AGE,
    },
    template: `
      <odlq-demo-frame active="insights" title="Insights">
        <odlq-segmented-control actions [options]="ranges" [(value)]="range" size="sm" label="Period" />
        <div style="display:grid;gap:16px">
          <odlq-kpi-row>
            <odlq-kpi-card label="Self-recovery rate" [value]="self + '%'" tone="success" hint="the metric of the transient path" />
            <odlq-kpi-card label="Max age" [value]="maxAge" tone="warning" hint="queue depth hides old messages" />
            <odlq-kpi-card label="Time to triage" value="42m" hint="permanent: arrival to first action" />
            <odlq-kpi-card label="Cost" value="$624" hint="storage + replay + operator" />
          </odlq-kpi-row>
          <div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(380px,1fr))">
            <odlq-card heading="Resolution funnel"><odlq-funnel [rows]="funnel" /></odlq-card>
            <odlq-card heading="Cost per cause">
              <odlq-chart-legend [series]="series" style="margin-bottom:12px" />
              <odlq-bar-chart [categories]="categories" [series]="series" [stacked]="true" [height]="240" [yFormat]="fmt" label="Cost per cause" />
            </odlq-card>
          </div>
          <odlq-card heading="Recurrence" [flush]="true">
            <odlq-data-table [columns]="recurrenceColumns" [rows]="recurrence" density="compact" caption="Recurring causes">
              <ng-template odlqCell="trend" let-v="value"><odlq-badge mono [tone]="v === 'growing' ? 'danger' : v === 'falling' ? 'success' : 'neutral'">{{ v }}</odlq-badge></ng-template>
            </odlq-data-table>
          </odlq-card>
          <odlq-card heading="Findings" [flush]="true">
            <odlq-data-table [columns]="findingColumns" [rows]="findings" density="compact" caption="Findings">
              <ng-template odlqCell="status" let-v="value"><odlq-badge mono [tone]="v === 'open' ? 'warning' : 'neutral'">{{ v }}</odlq-badge></ng-template>
            </odlq-data-table>
          </odlq-card>
        </div>
      </odlq-demo-frame>`,
  }),
};

/* ───────────── Alerts ───────────── */

const ALERT_COLUMNS: OdlqColumn[] = [
  { key: 'name', header: 'Alert', mono: true, sortable: true },
  { key: 'when', header: 'When', mono: true },
  { key: 'severity', header: 'Severity' },
  { key: 'audience', header: 'Audience' },
  { key: 'notify', header: 'Notify', mono: true, accessor: (a) => a.notify.join(', ') },
  { key: 'dedupe', header: 'Dedupe / schedule', mono: true, accessor: (a) => a.dedupe ?? a.schedule ?? '—' },
];
const INSTANCE_COLUMNS: OdlqColumn[] = [
  { key: 'at', header: 'When', mono: true, sortable: true },
  { key: 'alert', header: 'Alert', mono: true },
  { key: 'subject', header: 'Subject', mono: true },
  { key: 'summary', header: 'Context' },
  { key: 'status', header: 'Status' },
];

export const Alerts: Story = {
  render: () => ({
    props: { rules: ALERT_RULES, ruleColumns: ALERT_COLUMNS, instances: ALERT_INSTANCES, instanceColumns: INSTANCE_COLUMNS },
    template: `
      <odlq-demo-frame active="alerts" title="Alerts">
        <div style="display:grid;gap:20px">
          <odlq-alert tone="info" heading="Alerts are declared as code">
            Each alert is an <code>Alert</code> resource. Operational alerts go to whoever is on call; decision alerts go to whoever sets priorities.
          </odlq-alert>
          <odlq-card heading="Recent alerts" [flush]="true">
            <odlq-data-table [columns]="instanceColumns" [rows]="instances" density="compact" caption="Alert instances">
              <ng-template odlqCell="status" let-v="value"><odlq-badge mono [tone]="v === 'sent' ? 'success' : 'warning'">{{ v }}</odlq-badge></ng-template>
            </odlq-data-table>
          </odlq-card>
          <odlq-card heading="Rules" [flush]="true">
            <odlq-data-table [columns]="ruleColumns" [rows]="rules" density="compact" caption="Alert rules">
              <ng-template odlqCell="severity" let-v="value"><odlq-badge mono [tone]="v === 'page' ? 'danger' : 'info'">{{ v }}</odlq-badge></ng-template>
              <ng-template odlqCell="audience" let-v="value"><odlq-badge mono [tone]="v === 'operational' ? 'warning' : 'primary'">{{ v }}</odlq-badge></ng-template>
            </odlq-data-table>
          </odlq-card>
        </div>
      </odlq-demo-frame>`,
  }),
};

/* ───────────── Audit log ───────────── */

export const Audit: Story = {
  name: 'Audit log',
  render: () => ({
    props: { entries: AUDIT_LOG },
    template: `
      <odlq-demo-frame active="audit" title="Audit log">
        <div style="display:grid;gap:16px">
          <odlq-alert tone="info" heading="Never purged">Every state change is recorded in the same transaction as the change, with who, what, when and the result.</odlq-alert>
          <odlq-audit-log [entries]="entries" />
        </div>
      </odlq-demo-frame>`,
  }),
};

/* ───────────── Configuration ───────────── */

const RESOURCE_COLUMNS: OdlqColumn[] = [
  { key: 'kind', header: 'Kind', mono: true },
  { key: 'name', header: 'Name', mono: true },
  { key: 'scope', header: 'Scope', mono: true },
];

export const Configuration: Story = {
  render: () => ({
    props: { resources: RESOURCES, columns: RESOURCE_COLUMNS, selected: RESOURCES[1] },
    template: `
      <odlq-demo-frame active="config" title="Configuration">
        <div style="display:grid;gap:16px">
          <odlq-alert tone="info" heading="Declarative first">
            Resources live in the configuration repository and go through review. This view is read-only: use <code>opendlq diff</code> and <code>opendlq apply</code>.
          </odlq-alert>
          <div style="display:grid;gap:16px;grid-template-columns:minmax(320px,2fr) 3fr;align-items:start">
            <odlq-card heading="Resources" [flush]="true">
              <odlq-data-table [columns]="columns" [rows]="resources" [clickable]="true" [activeRow]="selected" density="compact" caption="Resources" (rowClick)="selected = $event" />
            </odlq-card>
            <odlq-card [heading]="selected.kind + ' · ' + selected.name">
              <odlq-code-block [code]="selected.yaml" language="properties" label="Resource YAML" />
            </odlq-card>
          </div>
        </div>
      </odlq-demo-frame>`,
  }),
};
