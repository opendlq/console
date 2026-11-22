/**
 * Domínio do OpenDLQ (ver docs/state-machine.md do projeto). Tipos e metadados de apresentação
 * compartilhados por componentes, stories, stores de `@opendlq/modules` e páginas.
 */
import type { OdlqAttempt } from './dlq/attempt-timeline';
import type { OdlqTone } from './types';

export type MessageState =
  | 'received'
  | 'enriched'
  | 'retrying'
  | 'held'
  | 'replaying'
  | 'runbook_matched'
  | 'awaiting_approval'
  | 'awaiting_operator'
  | 'recovered'
  | 'discarded'
  | 'routed'
  | 'expired';

export type FailureKind = 'transient' | 'permanent' | 'unknown';
export type ClassifiedBy = 'header' | 'rule' | 'group' | 'logs' | 'inference' | 'operator';
/** Quem fechou uma mensagem recuperada: o caminho transitório, um operador ou um runbook. */
export type ResolvedBy = 'self' | 'operator' | 'runbook';
export type ActorKind = 'person' | 'agent' | 'runbook' | 'controller';
export type EnrichmentStatus = 'enriched' | 'reused' | 'not_found' | 'unavailable' | 'skipped';

export const STATES: Record<MessageState, { tone: OdlqTone; open: boolean; hint: string }> = {
  received: { tone: 'neutral', open: true, hint: 'Stored by the Collector, not yet enriched' },
  enriched: { tone: 'neutral', open: true, hint: 'Enrichment done. Ready to classify' },
  retrying: { tone: 'warning', open: true, hint: 'Transient. A retry is scheduled' },
  held: { tone: 'warning', open: true, hint: 'Transient. The circuit is open, nothing is scheduled' },
  replaying: { tone: 'info', open: true, hint: 'Published, waiting for the consumer to confirm' },
  runbook_matched: { tone: 'primary', open: true, hint: 'A runbook matched and will act' },
  awaiting_approval: { tone: 'warning', open: true, hint: 'The runbook guardrail needs an operator approval' },
  awaiting_operator: { tone: 'danger', open: true, hint: 'Permanent. Waiting for a decision' },
  recovered: { tone: 'success', open: false, hint: 'The consumer processed it successfully' },
  discarded: { tone: 'neutral', open: false, hint: 'Dropped with a recorded reason' },
  routed: { tone: 'info', open: false, hint: 'Sent to another destination by a runbook' },
  expired: { tone: 'neutral', open: false, hint: 'TTL reached' },
};

/** Estados abertos na ordem em que a mensagem costuma percorrê-los. */
export const OPEN_STATES = (Object.keys(STATES) as MessageState[]).filter((s) => STATES[s].open);
export const isOpen = (s: MessageState): boolean => STATES[s].open;

export const KINDS: Record<FailureKind, { tone: OdlqTone; hint: string }> = {
  transient: { tone: 'info', hint: 'The environment failed. A retry helps, with time' },
  permanent: { tone: 'danger', hint: 'The message or the code is wrong. A retry never helps' },
  unknown: { tone: 'neutral', hint: 'Not classified yet' },
};

export interface LogLine {
  at: string;
  level: 'info' | 'warn' | 'error';
  text: string;
}

export interface Enrichment {
  status: EnrichmentStatus;
  logs: LogLine[];
  logsUrl?: string;
  traceUrl?: string;
}

/** Registro de uma mensagem da DLQ (docs/state-machine.md › Message record). */
export interface DlqMessage {
  id: string;
  receivedAt: string;
  /** Minutos desde a chegada à DLQ. */
  ageMin: number;
  sourceTopic: string;
  partition: number;
  offset: number;
  originalTopic: string;
  partitionKey: string;
  payload: string;
  headers: Record<string, string>;
  consumer: string;
  kind: FailureKind;
  reason: string;
  dependency?: string;
  groupKey: string;
  classifiedBy: ClassifiedBy;
  state: MessageState;
  resolvedBy?: ResolvedBy;
  attempts: OdlqAttempt[];
  nextRetryAt?: string;
  runbook?: string;
  expiresAt: string;
  enrichment: Enrichment;
}

/** Mensagens abertas com a mesma causa raiz (`group_key`). */
export interface FailureGroup {
  key: string;
  reason: string;
  kind: FailureKind;
  consumer: string;
  dependency?: string;
  classifiedBy: ClassifiedBy;
  runbook?: string;
  /** Mensagens abertas. */
  count: number;
  oldestMin: number;
  /** Chegadas por hora nas últimas 12 horas, da mais antiga à mais recente. */
  trend: number[];
  /** Estado aberto mais comum no grupo. */
  state: MessageState;
  states: Partial<Record<MessageState, number>>;
}

/** Linha do registro de auditoria: quem fez o quê, quando e com que resultado. */
export interface Transition {
  id: string;
  at: string;
  actor: ActorKind;
  by: string;
  action: string;
  target: string;
  from?: MessageState;
  to?: MessageState;
  count?: number;
  result: 'ok' | 'failed';
  note?: string;
  messageId?: string;
}

export type BreakerState = 'closed' | 'open' | 'draining';
export interface Breaker {
  dependency: string;
  consumer: string;
  state: BreakerState;
  /** Falhas transitórias distintas na janela. */
  windowFailures: number;
  threshold: number;
  windowSec: number;
  /** Há quanto tempo está aberto (min), quando não está fechado. */
  openedMin?: number;
  probe: { type: 'canary' | 'health_check'; everySec: number; nextInSec: number };
  drainRate: number;
}

export type RunbookStatus = 'suggested' | 'dry_run' | 'supervised' | 'automatic' | 'expired';
export type RunbookAction = 'transform_replay' | 'replay' | 'route' | 'discard';
export interface Runbook {
  name: string;
  consumer: string;
  /** Condição de casamento (CEL). */
  match: string;
  action: RunbookAction;
  status: RunbookStatus;
  usedThisHour: number;
  maxPerHour: number;
  approvalsDone: number;
  approvalsRequired: number;
  /** ISO (AAAA-MM-DD). */
  expires: string;
  daysLeft: number;
}

export interface AlertRule {
  name: string;
  when: string;
  severity: 'page' | 'report';
  audience: 'operational' | 'decision';
  notify: string[];
  dedupe?: string;
  schedule?: string;
}

export interface AlertInstance {
  id: string;
  alert: string;
  subject: string;
  status: 'pending' | 'sent';
  at: string;
  summary: string;
}

export type Detector = 'rate' | 'new_group' | 'recurrence' | 'mix_shift' | 'self_recovery_drop' | 'unstable_dependency' | 'analytics_lag';
export interface Finding {
  id: string;
  detector: Detector;
  subject: string;
  observed: string;
  expected: string;
  /** Distância da linha de base, em desvios-padrão. */
  score: number;
  window: string;
  status: 'open' | 'closed';
  openedAt: string;
}

export interface FunnelRow {
  key: string;
  label: string;
  count: number;
  tone: OdlqTone;
  hint?: string;
}

export interface ConfigResource {
  kind: 'Consumer' | 'Policy' | 'Classifier' | 'Runbook' | 'Alert' | 'Provider';
  name: string;
  scope: string;
  yaml: string;
}

/** 90 → "1h 30m", 3000 → "2d 2h". */
export function formatAge(min: number): string {
  if (min < 1) return '<1m';
  if (min < 60) return `${Math.round(min)}m`;
  if (min < 1440) {
    const m = Math.round(min % 60);
    return `${Math.floor(min / 60)}h${m ? ` ${m}m` : ''}`;
  }
  const h = Math.floor((min % 1440) / 60);
  return `${Math.floor(min / 1440)}d${h ? ` ${h}h` : ''}`;
}

/** Agrupa as mensagens abertas por causa raiz (`group_key`), da maior para a menor. */
export function groupMessages(messages: DlqMessage[]): FailureGroup[] {
  const groups = new Map<string, FailureGroup>();
  for (const m of messages) {
    if (!isOpen(m.state)) continue;
    let g = groups.get(m.groupKey);
    if (!g) {
      g = {
        key: m.groupKey, reason: m.reason, kind: m.kind, consumer: m.consumer, dependency: m.dependency,
        classifiedBy: m.classifiedBy, runbook: m.runbook, count: 0, oldestMin: 0, trend: Array(12).fill(0), state: m.state, states: {},
      };
      groups.set(m.groupKey, g);
    } else if (g.kind !== m.kind) g.kind = 'unknown';
    g.count++;
    g.oldestMin = Math.max(g.oldestMin, m.ageMin);
    g.states[m.state] = (g.states[m.state] ?? 0) + 1;
    const hour = Math.floor(m.ageMin / 60);
    if (hour < 12) g.trend[11 - hour]++;
  }
  for (const g of groups.values()) {
    g.state = (Object.entries(g.states) as [MessageState, number][]).sort((a, b) => b[1] - a[1])[0][0];
  }
  return [...groups.values()].sort((a, b) => b.count - a.count);
}

const FUNNEL_ROWS: Omit<FunnelRow, 'count'>[] = [
  { key: 'self', label: 'Recovered on its own', tone: 'success', hint: 'Transient path, no human involved' },
  { key: 'operator', label: 'Replayed by an operator', tone: 'info', hint: 'Permanent, fixed by a person' },
  { key: 'runbook', label: 'Handled by a runbook', tone: 'primary', hint: 'Permanent, fixed by a declared decision' },
  { key: 'routed', label: 'Routed', tone: 'neutral', hint: 'Sent to another destination' },
  { key: 'discarded', label: 'Discarded', tone: 'warning', hint: 'Dropped with a reason' },
  { key: 'expired', label: 'Expired', tone: 'neutral', hint: 'TTL reached' },
  { key: 'open', label: 'Still open', tone: 'danger', hint: 'Waiting' },
];

/** Funil de resolução: onde cada mensagem terminou (ou se ainda está aberta). */
export function funnel(messages: DlqMessage[]): FunnelRow[] {
  const counts = new Map<string, number>();
  for (const m of messages) {
    const key = m.state === 'recovered' ? (m.resolvedBy ?? 'self') : isOpen(m.state) ? 'open' : m.state;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return FUNNEL_ROWS.map((r) => ({ ...r, count: counts.get(r.key) ?? 0 }));
}

/** Parcela das mensagens fechadas que saiu sem ação humana (0–100). */
export function selfRecoveryRate(rows: FunnelRow[]): number {
  const closed = rows.filter((r) => r.key !== 'open').reduce((n, r) => n + r.count, 0);
  return closed ? Math.round(((rows.find((r) => r.key === 'self')?.count ?? 0) / closed) * 100) : 0;
}
