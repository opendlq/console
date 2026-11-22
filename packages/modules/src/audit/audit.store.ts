import { Injectable, computed, signal } from '@angular/core';
import type { ActorKind, Transition } from '@opendlq/ui';
import auditLog from './__fixtures__/audit-log.json';

/** Entrada a registrar: quem (`by`), `actor` e `result` têm padrão. */
export type AuditInput = Omit<Transition, 'id' | 'at' | 'actor' | 'by' | 'result'> & Partial<Pick<Transition, 'actor' | 'by' | 'result'>>;

/** Registro de auditoria: toda mudança de estado feita por pessoa, agente, runbook ou controller. Nunca é apagado. */
@Injectable({ providedIn: 'root' })
export class AuditStore {
  // ponytail: fixture; troque por inject(AuditService) do @opendlq/core quando existir.
  readonly entries = signal(auditLog as Transition[]);
  /** Filtro por tipo de ator; `null` mostra todos. */
  readonly actor = signal<ActorKind | null>(null);
  readonly visible = computed(() => (this.actor() ? this.entries().filter((e) => e.actor === this.actor()) : this.entries()));
  /** Quem está logado no console. */
  readonly operator = 'admin';
  private seq = 0;

  record(e: AuditInput): Transition {
    const entry: Transition = {
      ...e, actor: e.actor ?? 'person', by: e.by ?? this.operator, result: e.result ?? 'ok',
      id: `local-${++this.seq}`, at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };
    this.entries.update((l) => [entry, ...l]);
    return entry;
  }

  forMessage(id: string): Transition[] {
    return this.entries().filter((e) => e.messageId === id);
  }
}
