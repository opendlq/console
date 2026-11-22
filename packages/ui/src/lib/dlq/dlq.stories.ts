import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { OdlqButton } from '../button/button';
import { OdlqSelect } from '../select/select';
import {
  OPEN_STATES, STATES, funnel, groupMessages, messageHistory,
  type AlertInstance, type Breaker, type DlqMessage, type FailureKind, type MessageState, type Runbook, type Transition,
} from '../domain';
import { OdlqAttemptTimeline } from './attempt-timeline';
import { OdlqAuditLog } from './audit-log';
import { OdlqBreakerCard } from './breaker-card';
import { OdlqBulkActionBar } from './bulk-action-bar';
import alertInstances from './__fixtures__/alert-instances.json';
import auditLog from './__fixtures__/audit-log.json';
import breakers from './__fixtures__/breakers.json';
import messages from './__fixtures__/failure-messages.json';
import runbooks from './__fixtures__/runbooks.json';
import { OdlqFilterBar } from './filter-bar';
import { OdlqFunnel } from './funnel';
import { OdlqGroupTable } from './group-table';
import { OdlqHeaderList } from './header-list';
import { OdlqKindBadge } from './kind-badge';
import { OdlqLogExtract } from './log-extract';
import { OdlqMessageDetailDrawer } from './message-detail-drawer';
import { OdlqMessageTable } from './message-table';
import { OdlqReclassifyDialog } from './reclassify-dialog';
import { OdlqReplayDrawer } from './replay-drawer';
import { OdlqRiskCard } from './risk-card';
import { OdlqRunbookCard } from './runbook-card';
import { OdlqStateBadge } from './state-badge';
import { OdlqStateStrip } from './state-strip';

const meta: Meta = {
  title: 'DLQ/Compostos',
  tags: ['autodocs'],
  parameters: { layout: 'padded', docs: { story: { inline: false, iframeHeight: 420 } } },
  decorators: [
    moduleMetadata({
      imports: [
        OdlqButton, OdlqSelect, OdlqStateBadge, OdlqKindBadge, OdlqStateStrip, OdlqFunnel, OdlqFilterBar, OdlqGroupTable, OdlqMessageTable,
        OdlqBulkActionBar, OdlqAttemptTimeline, OdlqHeaderList, OdlqLogExtract, OdlqMessageDetailDrawer, OdlqReplayDrawer,
        OdlqReclassifyDialog, OdlqBreakerCard, OdlqRunbookCard, OdlqRiskCard, OdlqAuditLog,
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
const ALERT_INSTANCES = alertInstances as AlertInstance[];
const count = (f: (m: DlqMessage) => boolean) => DLQ_MESSAGES.filter(f).length;

const open = (state: MessageState) => DLQ_MESSAGES.filter((m) => m.state === state);
const sample = DLQ_MESSAGES.find((m) => m.state === 'awaiting_operator')!;
const sampleHistory = messageHistory(sample).reverse();
const option = (v: string) => ({ value: v, label: v });

export const Estados: Story = {
  name: 'StateBadge + KindBadge',
  render: () => ({
    props: { states: Object.keys(STATES), kinds: ['transient', 'permanent', 'unknown'] },
    template: `
      <div style="display:grid;gap:16px">
        <div style="display:flex;flex-wrap:wrap;gap:12px">@for (s of states; track s) { <odlq-state-badge [state]="s" /> }</div>
        <div style="display:flex;gap:12px">@for (k of kinds; track k) { <odlq-kind-badge [kind]="k" /> }</div>
      </div>`,
  }),
};

export const FaixaDeEstados: Story = {
  name: 'StateStrip',
  render: () => ({
    props: {
      counts: Object.fromEntries(OPEN_STATES.map((s) => [s, open(s).length])),
      selected: 'awaiting_operator',
    },
    template: `<odlq-state-strip [counts]="counts" [(selected)]="selected" />`,
  }),
};

export const Funil: Story = {
  name: 'Funnel',
  render: () => ({ props: { rows: FUNNEL }, template: `<div style="max-width:640px"><odlq-funnel [rows]="rows" /></div>` }),
};

export const Filtros: Story = {
  name: 'FilterBar',
  render: () => ({
    props: {
      consumers: ['order-events', 'payment-events', 'user-events'].map(option),
      kinds: ['transient', 'permanent', 'unknown'].map(option),
      query: '',
      consumer: 'payment-events',
      kind: null as FailureKind | null,
    },
    template: `
      <odlq-filter-bar [(query)]="query" [active]="!!consumer">
        <odlq-select [options]="consumers" [(value)]="consumer" prefix="Consumer:" placeholder="All" label="Consumer" />
        <odlq-select [options]="kinds" [(value)]="kind" prefix="Kind:" placeholder="All" label="Kind" />
      </odlq-filter-bar>`,
  }),
};

export const Grupos: Story = {
  name: 'GroupTable',
  parameters: { docs: { story: { inline: false, iframeHeight: 520 } } },
  render: () => ({
    props: { groups: FAILURE_GROUPS, selection: [FAILURE_GROUPS[0]] },
    template: `
      <div style="display:grid;gap:12px">
        <odlq-bulk-action-bar [count]="selection.length" noun="cause(s)" [editable]="false" />
        <odlq-group-table [groups]="groups" [(selection)]="selection" />
      </div>`,
  }),
};

export const GruposVazio: Story = {
  name: 'GroupTable (vazio)',
  render: () => ({ template: `<odlq-group-table [groups]="[]" />` }),
};

export const Mensagens: Story = {
  name: 'MessageTable + BulkActionBar',
  parameters: { docs: { story: { inline: false, iframeHeight: 560 } } },
  render: () => ({
    props: { messages: DLQ_MESSAGES.filter((m) => m.groupKey === 'schema-amount-type' && m.state === 'awaiting_operator').slice(0, 10), selection: [] as unknown[] },
    template: `
      <div style="display:grid;gap:12px">
        <odlq-bulk-action-bar [count]="selection.length || 2" />
        <odlq-message-table [messages]="messages" [(selection)]="selection" />
      </div>`,
  }),
};

export const MensagensVazia: Story = {
  name: 'MessageTable (vazia)',
  render: () => ({ template: `<odlq-message-table [messages]="[]" />` }),
};

export const Tentativas: Story = {
  name: 'AttemptTimeline + HeaderList',
  render: () => ({
    props: { attempts: open('retrying')[0].attempts, headers: open('retrying')[0].headers },
    template: `<div style="display:grid;gap:24px;max-width:520px"><odlq-attempt-timeline [attempts]="attempts" /><odlq-header-list [headers]="headers" /></div>`,
  }),
};

export const Logs: Story = {
  name: 'LogExtract',
  render: () => ({
    props: {
      found: DLQ_MESSAGES.find((m) => m.enrichment.status === 'enriched' && m.enrichment.logs.length > 1)!.enrichment,
      notFound: DLQ_MESSAGES.find((m) => m.enrichment.status === 'not_found')!.enrichment,
      unavailable: DLQ_MESSAGES.find((m) => m.enrichment.status === 'unavailable')!.enrichment,
      skipped: DLQ_MESSAGES.find((m) => m.enrichment.status === 'skipped')!.enrichment,
    },
    template: `
      <div style="display:grid;gap:24px;max-width:640px">
        <odlq-log-extract [enrichment]="found" /><odlq-log-extract [enrichment]="notFound" />
        <odlq-log-extract [enrichment]="unavailable" /><odlq-log-extract [enrichment]="skipped" />
      </div>`,
  }),
};

export const Inspetor: Story = {
  name: 'MessageDetailDrawer (inspetor)',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    props: { open: true, message: sample, history: sampleHistory },
    template: `
      <div style="padding:16px"><button odlq-button variant="outline" (click)="open = true">Inspect message</button></div>
      <odlq-message-detail-drawer [(open)]="open" [message]="message" [history]="history" />`,
  }),
};

export const Replay: Story = {
  name: 'ReplayDrawer',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    props: { open: true, messages: open('awaiting_operator').slice(0, 12), targets: ['payments.transactions', 'payments.manual-review'].map(option) },
    template: `
      <div style="padding:16px"><button odlq-button variant="outline" (click)="open = true">Replay 12 messages</button></div>
      <odlq-replay-drawer [(open)]="open" [messages]="messages" [targets]="targets" />`,
  }),
};

export const EditarEReplay: Story = {
  name: 'ReplayDrawer (editar e reenviar)',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    props: { open: true, messages: [sample], targets: ['payments.transactions'].map(option) },
    template: `
      <div style="padding:16px"><button odlq-button variant="outline" (click)="open = true">Edit and replay</button></div>
      <odlq-replay-drawer [(open)]="open" [messages]="messages" [targets]="targets" [edit]="true" />`,
  }),
};

export const Reclassificar: Story = {
  name: 'ReclassifyDialog',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    props: { open: true },
    template: `
      <div style="padding:16px"><button odlq-button variant="outline" (click)="open = true">Reclassify</button></div>
      <odlq-reclassify-dialog [(open)]="open" [count]="27" noun="messages" current="permanent" />`,
  }),
};

export const Breakers: Story = {
  name: 'BreakerCard',
  render: () => ({
    props: { breakers: BREAKERS, held: BREAKERS.map((b) => count((m) => m.state === 'held' && m.dependency === b.dependency)) },
    template: `
      <div style="display:grid;gap:16px;grid-template-columns:repeat(3,minmax(0,1fr))">
        @for (b of breakers; track b.dependency; let i = $index) { <odlq-breaker-card [breaker]="b" [held]="held[i]" /> }
      </div>`,
  }),
};

export const Runbooks: Story = {
  name: 'RunbookCard',
  render: () => ({
    props: { runbooks: RUNBOOKS, pending: RUNBOOKS.map((r) => count((m) => m.runbook === r.name && m.state === 'awaiting_approval')) },
    template: `
      <div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(340px,1fr))">
        @for (r of runbooks; track r.name; let i = $index) { <odlq-runbook-card [runbook]="r" [pending]="pending[i]" /> }
      </div>`,
  }),
};

export const Risco: Story = {
  name: 'RiskCard',
  render: () => ({
    props: { items: [{ name: 'schema-amount-type', value: 27 }, { name: 'email-null', value: 9 }, { name: 'sku-format-v1', value: 3 }] },
    template: `
      <div style="display:grid;gap:16px;grid-template-columns:repeat(3,minmax(0,1fr))">
        <odlq-risk-card heading="Waiting for an operator" metric="39" hint="permanent failures" [percent]="78" badge="High" [items]="items" />
        <odlq-risk-card heading="Max age" metric="9d 0h" hint="schema-amount-type" [percent]="64" badge="Medium" />
        <odlq-risk-card heading="Self-recovery" metric="67%" hint="of closed messages" [percent]="12" badge="Low" />
      </div>`,
  }),
};

export const Auditoria: Story = {
  name: 'AuditLog',
  parameters: { docs: { story: { inline: false, iframeHeight: 560 } } },
  render: () => ({ props: { entries: AUDIT_LOG }, template: `<odlq-audit-log [entries]="entries" />` }),
};

export const Alertas: Story = {
  name: 'AlertInstance (resumo com contexto)',
  render: () => ({
    props: { items: ALERT_INSTANCES },
    template: `<ul style="margin:0;padding:0;list-style:none;display:grid;gap:8px;max-width:640px">@for (a of items; track a.id) { <li style="padding:12px;border:1px solid var(--ui-border);border-radius:8px"><strong>{{ a.alert }}</strong> · {{ a.subject }}<br><small style="color:var(--ui-text-muted)">{{ a.summary }}</small></li> }</ul>`,
  }),
};
