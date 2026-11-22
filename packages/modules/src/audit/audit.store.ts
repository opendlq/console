import { Injectable, signal } from '@angular/core';
import { AUDIT_LOG, type Transition } from '@opendlq/ui';

/** Entrada a registrar: quem (`by`), `actor` e `result` têm padrão. */
export type AuditInput = Omit<Transition, 'id' | 'at' | 'actor' | 'by' | 'result'> & Partial<Pick<Transition, 'actor' | 'by' | 'result'>>;

/** Registro de auditoria: toda mudança de estado feita por pessoa, agente, runbook ou controller. Nunca é apagado. */
@Injectable({ providedIn: 'root' })
export class AuditStore {
  /** ponytail: dados de exemplo; troque por chamadas à API do OpenDLQ. */
  readonly entries = signal<Transition[]>(AUDIT_LOG);
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
