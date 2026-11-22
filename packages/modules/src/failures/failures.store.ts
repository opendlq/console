import { Injectable, computed, inject, signal } from '@angular/core';
import {
  CONSUMERS, DLQ_MESSAGES, OPEN_STATES, baselineHistory, funnel, groupMessages, isOpen, selfRecoveryRate,
  type DlqMessage, type FailureGroup, type FailureKind, type MessageState, type Transition,
} from '@opendlq/ui';
import { AuditStore } from '../audit/audit.store';

export interface MoveAudit {
  action: string;
  note?: string;
}

/** Falhas da DLQ: grupos por causa, indicadores, filtros e as ações do operador (replay, editar e reenviar, reclassificar, descartar). */
@Injectable({ providedIn: 'root' })
export class FailuresStore {
  private readonly audit = inject(AuditStore);

  /** ponytail: dados de exemplo; troque por chamadas à API do OpenDLQ. */
  readonly messages = signal<DlqMessage[]>(DLQ_MESSAGES);
  readonly consumers = CONSUMERS;

  readonly query = signal('');
  readonly consumer = signal<string | null>(null);
  readonly kind = signal<FailureKind | null>(null);
  readonly state = signal<MessageState | null>(null);

  readonly groups = computed(() => groupMessages(this.messages()));
  readonly visibleGroups = computed(() => {
    const q = this.query().trim().toLowerCase();
    const [consumer, kind, state] = [this.consumer(), this.kind(), this.state()];
    return this.groups().filter(
      (g) =>
        (!q || `${g.key} ${g.reason} ${g.consumer} ${g.dependency ?? ''}`.toLowerCase().includes(q)) &&
        (!consumer || g.consumer === consumer) &&
        (!kind || g.kind === kind) &&
        (!state || !!g.states[state]),
    );
  });
  readonly filtering = computed(() => !!(this.query().trim() || this.consumer() || this.kind() || this.state()));

  readonly open = computed(() => this.messages().filter((m) => isOpen(m.state)));
  readonly stateCounts = computed(() => {
    const counts: Partial<Record<MessageState, number>> = {};
    for (const s of OPEN_STATES) counts[s] = 0;
    for (const m of this.open()) counts[m.state]! += 1;
    return counts;
  });
  readonly awaitingOperator = computed(() => this.stateCounts().awaiting_operator ?? 0);
  /** Idade (min) da mensagem aberta mais antiga: o alerta principal, pois a profundidade esconde as antigas. */
  readonly maxAgeMin = computed(() => this.open().reduce((max, m) => Math.max(max, m.ageMin), 0));
  readonly funnel = computed(() => funnel(this.messages()));
  readonly selfRecovery = computed(() => selfRecoveryRate(this.funnel()));

  clearFilters(): void {
    this.query.set('');
    this.consumer.set(null);
    this.kind.set(null);
    this.state.set(null);
  }

  /** Mensagens abertas do grupo, da mais recente para a mais antiga. */
  messagesOf(groupKey: string): DlqMessage[] {
    return this.open().filter((m) => m.groupKey === groupKey);
  }

  /** Ids das mensagens abertas dos grupos informados (ação em lote por causa). */
  idsOfGroups(keys: string[]): string[] {
    const set = new Set(keys);
    return this.open().filter((m) => set.has(m.groupKey)).map((m) => m.id);
  }

  /** Histórico: o que os controllers fizeram + o que operadores, agentes e runbooks fizeram depois. */
  historyOf(m: DlqMessage): Transition[] {
    return [...this.audit.forMessage(m.id), ...baselineHistory(m).reverse()];
  }

  /** Replay para o destino (padrão: o tópico original), com limite de taxa. Só afeta mensagens abertas. */
  replay(ids: string[], opts: { target?: string; rate?: number } = {}): number {
    const note = [opts.target && `to ${opts.target}`, opts.rate && `${opts.rate} msg/s`].filter(Boolean).join(', ');
    return this.move(ids, 'replaying', { action: 'replay', note }, {});
  }

  /** Troca o payload de uma mensagem e a reenvia (mesmo `x-dlq-id`). */
  editAndReplay(id: string, payload: string, opts: { target?: string } = {}): number {
    return this.move([id], 'replaying', { action: 'edit and replay', note: opts.target && `to ${opts.target}` }, { payload });
  }

  /** Transitório volta a `retrying`; permanente espera um operador. */
  reclassify(ids: string[], kind: FailureKind): number {
    const to: MessageState = kind === 'transient' ? 'retrying' : 'awaiting_operator';
    return this.move(ids, to, { action: 'reclassify', note: `kind=${kind}` }, { kind, classifiedBy: 'operator' });
  }

  discard(ids: string[], reason = 'discarded by operator'): number {
    return this.move(ids, 'discarded', { action: 'discard', note: reason }, {});
  }

  /** Move as mensagens abertas para `to` e registra uma entrada de auditoria. Devolve quantas foram movidas. */
  move(ids: string[], to: MessageState, audit: MoveAudit & { actor?: Transition['actor']; by?: string }, patch: Partial<DlqMessage> = {}): number {
    const set = new Set(ids);
    const hit = this.messages().filter((m) => set.has(m.id) && isOpen(m.state));
    if (!hit.length) return 0;
    const moved = new Set(hit.map((m) => m.id));
    this.messages.update((l) => l.map((m) => (moved.has(m.id) ? { ...m, ...patch, state: to } : m)));
    const keys = new Set(hit.map((m) => m.groupKey));
    this.audit.record({
      action: audit.action,
      actor: audit.actor,
      by: audit.by,
      note: audit.note || undefined,
      count: hit.length,
      to,
      from: new Set(hit.map((m) => m.state)).size === 1 ? hit[0].state : undefined,
      target: hit.length === 1 ? `message:${hit[0].id.slice(0, 8)}` : keys.size === 1 ? `group:${hit[0].groupKey}` : `${keys.size} groups`,
      messageId: hit.length === 1 ? hit[0].id : undefined,
    });
    return hit.length;
  }
}
