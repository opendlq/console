/**
 * Dados de exemplo compartilhados por stories e pelo app de demonstração. Determinísticos (sem `Math.random`)
 * e inspirados no demo do V0 do OpenDLQ: um consumer chama um serviço `dep` que cai e volta, e payloads inválidos aparecem agrupados.
 */
import type { OdlqAttempt } from './dlq/attempt-timeline';
import type {
  AlertInstance, AlertRule, Breaker, ClassifiedBy, ConfigResource, DlqMessage, EnrichmentStatus, Finding, FailureKind,
  LogLine, MessageState, ResolvedBy, Runbook, Transition,
} from './domain';
import { funnel, groupMessages } from './domain';

/** "Agora" fixo das stories: 2026-11-22 12:00 UTC. */
export const MOCK_NOW = Date.UTC(2026, 10, 22, 12, 0, 0);
const ts = (minAgo: number): string => new Date(MOCK_NOW - minAgo * 60_000).toISOString().slice(0, 19).replace('T', ' ');

function lcg(seed: number): () => number {
  let s = seed;
  return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
}
const hex = (r: () => number, n: number) => Array.from({ length: n }, () => Math.floor(r() * 16).toString(16)).join('');
const between = (r: () => number, lo: number, hi: number) => Math.floor(lo + r() * (hi - lo + 1));

type Bucket = MessageState | 'recovered:self' | 'recovered:operator' | 'recovered:runbook';
interface Spec {
  key: string;
  consumer: string;
  kind: FailureKind;
  reason: string;
  dependency?: string;
  classifiedBy: ClassifiedBy;
  runbook?: string;
  enrichment?: EnrichmentStatus;
  /** Idade (min) das mensagens abertas. */
  age: [number, number];
  payload: (n: number) => unknown;
  logs: [LogLine['level'], string][];
  buckets: Partial<Record<Bucket, number>>;
}

const order = (n: number, sku = 'A-100') => ({
  orderId: `ord_${(0x8f2c1 + n * 37).toString(16)}`,
  customer: { id: 4000 + n, tier: n % 3 ? 'silver' : 'gold' },
  items: [{ sku, qty: 1 + (n % 3) }],
  total: +(20 + n * 3.7).toFixed(2),
});
const payment = (n: number) => ({
  source_account: 'DE70700500000005193886',
  dst_account: 'DE88700500000006052885',
  currency: 'EUR',
  amount: n % 2 ? '1 014 551' : '2 300,00',
});

const SPECS: Spec[] = [
  {
    key: 'inventory-timeout', consumer: 'order-events', kind: 'transient', reason: 'timeout: inventory-service', dependency: 'inventory-service',
    classifiedBy: 'header', age: [5, 180], payload: (n) => order(n),
    logs: [['warn', 'GET /inventory/stock?sku=A-100 timed out after 30000ms'], ['error', 'inventory-service: upstream connect error or disconnect/reset before headers']],
    buckets: { held: 40, retrying: 12, 'recovered:self': 90 },
  },
  {
    key: 'fraud-check-rate-limit', consumer: 'payment-events', kind: 'transient', reason: 'http 429: fraud-check', dependency: 'fraud-check',
    classifiedBy: 'rule', enrichment: 'skipped', age: [3, 90], payload: payment,
    logs: [['warn', 'POST /fraud/score → 429 Too Many Requests (retry-after: 12s)']],
    buckets: { retrying: 18, replaying: 6, 'recovered:self': 55, expired: 2 },
  },
  {
    key: 'sku-format-v1', consumer: 'order-events', kind: 'permanent', reason: 'validation: sku format',
    classifiedBy: 'rule', runbook: 'legacy-sku-format', age: [20, 2900], payload: (n) => order(n, ['A100', '100-A', 'a_100'][n % 3]),
    logs: [['error', 'ValidationError: items[0].sku does not match ^[A-Z]-\\d+$']],
    buckets: { runbook_matched: 14, awaiting_approval: 3, 'recovered:runbook': 31 },
  },
  {
    key: 'schema-amount-type', consumer: 'payment-events', kind: 'permanent', reason: 'schema: amount must be a number',
    classifiedBy: 'logs', age: [60, 13000], payload: payment,
    logs: [['error', 'SchemaValidationException: $.amount: string found, number expected'], ['warn', 'payments-api v2.14 deployed 3 minutes before the first failure']],
    buckets: { awaiting_operator: 27, 'recovered:operator': 12, discarded: 9 },
  },
  {
    key: 'email-null', consumer: 'user-events', kind: 'permanent', reason: 'constraint: email not null',
    classifiedBy: 'group', enrichment: 'not_found', age: [200, 4000], payload: (n) => ({ userId: 9000 + n, email: null, tenant: n % 5 === 0 ? 'test' : 'acme' }),
    logs: [],
    buckets: { awaiting_operator: 9, discarded: 8, routed: 8 },
  },
  {
    key: 'ledger-deadlock', consumer: 'payment-events', kind: 'transient', reason: 'deadlock: ledger-db', dependency: 'ledger-db',
    classifiedBy: 'inference', enrichment: 'unavailable', age: [2, 40], payload: payment,
    logs: [],
    buckets: { held: 8, retrying: 3, received: 3, 'recovered:self': 24 },
  },
  {
    key: 'unknown-magic-byte', consumer: 'payment-events', kind: 'unknown', reason: 'deserialization: unknown magic byte',
    classifiedBy: 'inference', enrichment: 'reused', age: [1, 30], payload: () => '[binary] 00 00 01 86 a0 0a 7b 22 69 64 22 3a',
    logs: [['error', 'DeserializationException: Unknown magic byte! (topic payments.transactions)']],
    buckets: { enriched: 4, received: 2, 'recovered:operator': 10, expired: 3 },
  },
];

const TOPIC: Record<string, string> = { 'order-events': 'order-events', 'payment-events': 'payments.transactions', 'user-events': 'user-registrations' };

function generate(): DlqMessage[] {
  const r = lcg(42);
  const out: DlqMessage[] = [];
  let n = 0;
  for (const spec of SPECS) {
    for (const [bucket, count] of Object.entries(spec.buckets) as [Bucket, number][]) {
      const [state, by] = bucket.split(':') as [MessageState, ResolvedBy | undefined];
      for (let i = 0; i < count; i++, n++) {
        const closed = state === 'recovered' || state === 'discarded' || state === 'routed' || state === 'expired';
        const ageMin = closed ? between(r, 240, 8000) : between(r, ...spec.age);
        const id = `${hex(r, 8)}-${hex(r, 4)}-4${hex(r, 3)}-a${hex(r, 3)}-${hex(r, 12)}`;
        const failed = spec.kind === 'permanent' ? 0 : state === 'received' || state === 'enriched' ? 0 : between(r, 1, state === 'held' ? 2 : 4);
        const attempts: OdlqAttempt[] = Array.from({ length: failed }, (_, k) => ({
          at: ts(Math.max(0, ageMin - (2 ** k) * 0.5)), outcome: 'failed', message: spec.reason, durationMs: spec.reason.startsWith('timeout') ? 30000 : between(r, 20, 400),
        }));
        if (state === 'replaying') attempts.push({ at: ts(1), outcome: 'queued' });
        if (state === 'recovered') attempts.push({ at: ts(Math.max(0, ageMin - 3)), outcome: 'succeeded', durationMs: between(r, 30, 250) });
        const payload = spec.payload(n);
        const attempt = String(attempts.filter((a) => a.outcome !== 'queued').length);
        const customer = `cust-${between(r, 1000, 9999)}`;
        out.push({
          id, receivedAt: ts(ageMin), ageMin,
          sourceTopic: `${spec.consumer}.dlq`, partition: between(r, 0, 5), offset: between(r, 10_000, 99_999),
          originalTopic: TOPIC[spec.consumer], partitionKey: customer,
          payload: typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2),
          headers: {
            ...(spec.classifiedBy === 'header' ? { 'x-failure-kind': spec.kind } : {}),
            'x-failure-reason': spec.reason,
            ...(spec.dependency ? { 'x-failure-dependency': spec.dependency } : {}),
            'x-attempt': '1',
            ...(failed ? { 'x-dlq-id': id, 'x-dlq-attempt': attempt } : {}),
            traceparent: `00-${hex(r, 32)}-${hex(r, 16)}-01`,
            'x-request-id': `req-${hex(r, 8)}`,
          },
          consumer: spec.consumer, kind: spec.kind, reason: spec.reason, dependency: spec.dependency,
          groupKey: spec.key, classifiedBy: spec.classifiedBy, state, resolvedBy: by, attempts,
          nextRetryAt: state === 'retrying' ? ts(-between(r, 1, 25)) : undefined,
          runbook: spec.runbook, expiresAt: ts(ageMin - 72 * 60),
          enrichment: {
            status: spec.enrichment ?? 'enriched',
            logs: (spec.enrichment === undefined || spec.enrichment === 'enriched' || spec.enrichment === 'reused'
              ? spec.logs.map(([level, text], k) => ({ at: ts(ageMin + 0.05 * (spec.logs.length - k)).slice(11), level, text }))
              : []),
            logsUrl: 'https://grafana.internal/explore?query=request_id',
            traceUrl: 'https://grafana.internal/explore?traceId=' + hex(r, 8),
          },
        });
      }
    }
  }
  return out.sort((a, b) => a.ageMin - b.ageMin);
}

export const DLQ_MESSAGES: DlqMessage[] = generate();
export const FAILURE_GROUPS = groupMessages(DLQ_MESSAGES);
export const CONSUMERS = [...new Set(SPECS.map((s) => s.consumer))];

/** Histórico plausível de uma mensagem: do que o Collector/Enricher/Policy Engine fizeram até o estado atual. */
export function baselineHistory(m: DlqMessage): Transition[] {
  const t = (i: number, by: string, action: string, from: MessageState | undefined, to: MessageState, note?: string): Transition => ({
    id: `${m.id}-${i}`, at: ts(m.ageMin - i * 0.05), actor: 'controller', by, action, target: `message:${m.id.slice(0, 8)}`, from, to, result: 'ok', note, messageId: m.id,
  });
  const out = [t(0, 'collector', 'received', undefined, 'received'), t(1, 'enricher', 'enriched', 'received', 'enriched', `logs: ${m.enrichment.status}`)];
  if (m.state === 'received' || m.state === 'enriched') return out.slice(0, m.state === 'received' ? 1 : 2);
  const via = m.state === 'awaiting_operator' || m.state === 'retrying' || m.state === 'held' || m.state === 'runbook_matched' ? m.state : 'awaiting_operator';
  out.push(t(2, 'policy-engine', `classified ${m.kind} by ${m.classifiedBy}`, 'enriched', via));
  return out;
}

const person = (id: string, at: number, by: string, action: string, target: string, count: number, to: MessageState, note?: string): Transition => ({
  id, at: ts(at), actor: 'person', by, action, target, count, to, result: 'ok', note,
});

export const AUDIT_LOG: Transition[] = [
  { id: 'a1', at: ts(47), actor: 'controller', by: 'transient-runner', action: 'circuit opened', target: 'dependency:inventory-service', count: 40, from: 'retrying', to: 'held', result: 'ok', note: '34 distinct failures in 60s (threshold 20)' },
  { id: 'a2', at: ts(95), actor: 'controller', by: 'transient-runner', action: 'probe passed, draining', target: 'dependency:ledger-db', count: 8, from: 'held', to: 'retrying', result: 'ok', note: 'drain rate 50 msg/s' },
  { id: 'a3', at: ts(130), actor: 'runbook', by: 'legacy-sku-format@3', action: 'awaiting approval', target: 'group:sku-format-v1', count: 3, from: 'runbook_matched', to: 'awaiting_approval', result: 'ok', note: 'first 3 runs need approval' },
  person('a4', 210, 'ana.souza', 'replay', 'group:schema-amount-type', 12, 'replaying', 'after payments-api hotfix'),
  person('a5', 260, 'ana.souza', 'discard', 'group:schema-amount-type', 9, 'discarded', 'test data from QA'),
  { id: 'a6', at: ts(340), actor: 'agent', by: 'mcp:claude', action: 'reclassify', target: 'group:unknown-magic-byte', count: 10, to: 'awaiting_operator', result: 'ok', note: 'kind=permanent' },
  { id: 'a7', at: ts(410), actor: 'controller', by: 'policy-engine', action: 'classified permanent by logs', target: 'group:schema-amount-type', count: 27, from: 'enriched', to: 'awaiting_operator', result: 'ok' },
  { id: 'a8', at: ts(520), actor: 'runbook', by: 'drop-test-tenant@1', action: 'discard', target: 'group:email-null', count: 8, from: 'runbook_matched', to: 'discarded', result: 'ok', note: 'tenant == "test"' },
  { id: 'a9', at: ts(600), actor: 'controller', by: 'publisher', action: 'replay', target: 'group:fraud-check-rate-limit', count: 6, from: 'retrying', to: 'replaying', result: 'failed', note: 'no ack before timeout (10s), back to enriched' },
  person('a10', 1100, 'rui.lima', 'approve', 'runbook:ledger-reconcile-route', 1, 'runbook_matched', 'run 2 of 3'),
];

export const BREAKERS: Breaker[] = [
  { dependency: 'inventory-service', consumer: 'order-events', state: 'open', windowFailures: 34, threshold: 20, windowSec: 60, openedMin: 47, probe: { type: 'canary', everySec: 120, nextInSec: 45 }, drainRate: 50 },
  { dependency: 'ledger-db', consumer: 'payment-events', state: 'draining', windowFailures: 0, threshold: 20, windowSec: 60, openedMin: 95, probe: { type: 'canary', everySec: 30, nextInSec: 0 }, drainRate: 50 },
  { dependency: 'fraud-check', consumer: 'payment-events', state: 'closed', windowFailures: 6, threshold: 20, windowSec: 60, probe: { type: 'health_check', everySec: 30, nextInSec: 0 }, drainRate: 50 },
];

export const RUNBOOKS: Runbook[] = [
  { name: 'legacy-sku-format', consumer: 'order-events', match: 'reason == "validation: sku format"', action: 'transform_replay', status: 'supervised', usedThisHour: 0, maxPerHour: 500, approvalsDone: 0, approvalsRequired: 3, expires: '2027-03-01', daysLeft: 99 },
  { name: 'drop-test-tenant', consumer: 'user-events', match: 'payload.tenant == "test"', action: 'discard', status: 'automatic', usedThisHour: 212, maxPerHour: 1000, approvalsDone: 3, approvalsRequired: 3, expires: '2026-12-05', daysLeft: 13 },
  { name: 'ledger-reconcile-route', consumer: 'payment-events', match: 'dependency == "ledger-db" && attempts >= 5', action: 'route', status: 'supervised', usedThisHour: 4, maxPerHour: 200, approvalsDone: 2, approvalsRequired: 3, expires: '2027-01-15', daysLeft: 54 },
  { name: 'email-null-discard', consumer: 'user-events', match: 'group_key == "email-null"', action: 'discard', status: 'suggested', usedThisHour: 0, maxPerHour: 100, approvalsDone: 0, approvalsRequired: 3, expires: '2027-02-01', daysLeft: 71 },
  { name: 'old-currency-fix', consumer: 'payment-events', match: 'reason == "schema: currency"', action: 'transform_replay', status: 'expired', usedThisHour: 0, maxPerHour: 300, approvalsDone: 3, approvalsRequired: 3, expires: '2026-11-15', daysLeft: -7 },
];

export const ALERT_RULES: AlertRule[] = [
  { name: 'order-events-stuck', when: 'max_age > 2h', severity: 'page', audience: 'operational', notify: ['pagerduty-oncall'] },
  { name: 'new-permanent-group', when: 'poisoned', severity: 'page', audience: 'operational', notify: ['slack-oncall'], dedupe: '1h' },
  { name: 'circuit-open-too-long', when: 'circuit_opened && duration > 30m', severity: 'page', audience: 'operational', notify: ['pagerduty-oncall'] },
  { name: 'inflow-anomaly', when: 'finding.detector == "rate" and finding.score >= 3', severity: 'report', audience: 'operational', notify: ['slack-oncall'], dedupe: '2h' },
  { name: 'recurring-causes', when: 'recurrence.episodes >= 3 and recurrence.cost_trend == "growing"', severity: 'report', audience: 'decision', notify: ['slack-eng-priorities'], schedule: 'weekly' },
  { name: 'runbook-expiring', when: 'runbook_expiring', severity: 'report', audience: 'decision', notify: ['slack-eng-priorities'], schedule: 'weekly' },
];

export const ALERT_INSTANCES: AlertInstance[] = [
  { id: 'ai1', alert: 'circuit-open-too-long', subject: 'inventory-service', status: 'pending', at: ts(17), summary: 'Circuit open for 47 min. 40 messages held. Next probe in 45s.' },
  { id: 'ai2', alert: 'new-permanent-group', subject: 'schema-amount-type', status: 'sent', at: ts(415), summary: '27 messages since 10:02. Sample: "$.amount: string found, number expected". No runbook.' },
  { id: 'ai3', alert: 'inflow-anomaly', subject: 'payment-events', status: 'sent', at: ts(380), summary: 'Inflow 3.4σ above the usual for this hour of the week.' },
  { id: 'ai4', alert: 'runbook-expiring', subject: 'drop-test-tenant', status: 'pending', at: ts(5), summary: 'Expires in 13 days. It handled 2,904 messages in the last 7 days.' },
];

export const FINDINGS: Finding[] = [
  { id: 'f1', detector: 'rate', subject: 'payment-events', observed: '412 msg/h', expected: '96 msg/h', score: 3.4, window: '1h', status: 'open', openedAt: ts(385) },
  { id: 'f2', detector: 'new_group', subject: 'schema-amount-type', observed: 'first seen', expected: 'not seen in 30d', score: 0, window: '30d', status: 'open', openedAt: ts(415) },
  { id: 'f3', detector: 'unstable_dependency', subject: 'inventory-service', observed: '4 openings', expected: '≤ 1 / 24h', score: 3.1, window: '24h', status: 'open', openedAt: ts(47) },
  { id: 'f4', detector: 'recurrence', subject: 'sku-format-v1', observed: '4 episodes', expected: '< 3', score: 0, window: '60d', status: 'open', openedAt: ts(2900) },
  { id: 'f5', detector: 'self_recovery_drop', subject: 'order-events', observed: '61%', expected: '88%', score: 2.6, window: '24h', status: 'closed', openedAt: ts(4300) },
];

export const FUNNEL = funnel(DLQ_MESSAGES);

/** Entrada vs. saída por hora (últimas 12 h). */
export const INFLOW = {
  categories: ['01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00'],
  in: [22, 18, 25, 19, 24, 30, 41, 96, 188, 412, 301, 118],
  out: [20, 19, 24, 18, 23, 28, 35, 60, 120, 210, 260, 240],
};

/** Custo por causa no período (USD): armazenamento + replays + tempo de operador. */
export const COST = {
  categories: ['schema-amount-type', 'sku-format-v1', 'inventory-timeout', 'unknown-magic-byte', 'email-null'],
  series: [
    { name: 'Storage', values: [42, 18, 6, 4, 9] },
    { name: 'Replay', values: [31, 55, 70, 3, 0] },
    { name: 'Operator', values: [260, 40, 0, 85, 55] },
  ],
};

export const RECURRENCE = [
  { cause: 'sku-format-v1', episodes: 4, last: '2026-11-22', cost: 113, trend: 'growing' },
  { cause: 'inventory-timeout', episodes: 3, last: '2026-11-22', cost: 76, trend: 'stable' },
  { cause: 'schema-amount-type', episodes: 1, last: '2026-11-22', cost: 333, trend: 'growing' },
  { cause: 'email-null', episodes: 2, last: '2026-11-21', cost: 64, trend: 'falling' },
];

export const RESOURCES: ConfigResource[] = [
  {
    kind: 'Consumer', name: 'order-events', scope: 'order-events',
    yaml: `kind: Consumer
metadata:
  name: order-events
spec:
  source:    { plugin: kafka, topic: order-events.dlq, group: opendlq }
  replay_to: { plugin: kafka, topic: order-events }
  serde: json
  group_key: 'headers["x-failure-reason"]'
  correlation_headers: [traceparent, x-request-id]
  enrichment:
    sources:
      - provider: loki-prod
        extract:
          error_class: 'log.json.error.type'
    timeout: 3s
    retries: 2
    on_unavailable: continue`,
  },
  {
    kind: 'Policy', name: 'order-events', scope: 'order-events',
    yaml: `kind: Policy
metadata:
  name: order-events
  consumer: order-events
spec:
  retry:    { max: 5, base: 30s, factor: 2, cap: 30m, jitter: 0.2 }
  breaker:  { window: 60s, threshold: 20 }
  probe:    { type: canary, every: 30s, cap: 5m }
  drain:    { rate: 50 }
  recovery: { mode: ack, topic: opendlq.ack, timeout: 10s }
  ttl: 72h`,
  },
  {
    kind: 'Runbook', name: 'legacy-sku-format', scope: 'order-events',
    yaml: `kind: Runbook
metadata:
  name: legacy-sku-format
  consumer: order-events
spec:
  match:
    reason: "validation: sku format"
    group_key: "sku-format-v1"
  action:
    transform: ./transforms/sku-v1-to-v2.jsonata
    replay: original
  guardrails:
    max_per_hour: 500
    approval_required_first: 3
    expires: 2027-03-01`,
  },
  {
    kind: 'Alert', name: 'order-events-stuck', scope: 'order-events',
    yaml: `kind: Alert
metadata:
  name: order-events-stuck
  consumer: order-events
spec:
  when: max_age > 2h
  severity: page
  audience: operational
  notify: [pagerduty-oncall]`,
  },
  {
    kind: 'Provider', name: 'loki-prod', scope: 'global',
    yaml: `kind: Provider
metadata:
  name: loki-prod
spec:
  type: loki
  url: https://loki.internal
  auth: { secret_ref: loki-token }
  link_template: "https://grafana.internal/explore?traceId={{trace_id}}"`,
  },
];
