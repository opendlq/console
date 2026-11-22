import { Injectable, computed, inject, signal } from '@angular/core';
import type { DlqMessage, FailureKind } from '@opendlq/ui';
import { FailuresStore } from './failures.store';

/** Estado da tela de uma causa: mensagens do grupo, busca, seleção, mensagem aberta e ações sobre mensagens. */
@Injectable()
export class GroupViewStore {
  private readonly failures = inject(FailuresStore);

  /** `group_key` da rota. */
  readonly key = signal('');
  readonly query = signal('');
  readonly selection = signal<DlqMessage[]>([]);
  readonly activeId = signal<string | null>(null);

  readonly group = computed(() => this.failures.groups().find((g) => g.key === this.key()));
  readonly messages = computed(() => this.failures.messagesOf(this.key()));
  readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? this.messages().filter((m) => `${m.id} ${m.partitionKey} ${m.reason} ${m.payload}`.toLowerCase().includes(q)) : this.messages();
  });
  /** Mensagem aberta no inspetor; acompanha as mudanças de estado (mesmo depois de descartada). */
  readonly active = computed(() => this.failures.messages().find((m) => m.id === this.activeId()) ?? null);
  /** Destinos possíveis de replay: o tópico original do consumer. */
  readonly targets = computed(() => [...new Set(this.messages().map((m) => m.originalTopic))]);

  replay(list: DlqMessage[], opts: { target?: string; rate?: number } = {}): number {
    return this.done(list, this.failures.replay(ids(list), opts));
  }

  editAndReplay(m: DlqMessage, payload: string, opts: { target?: string } = {}): number {
    return this.done([m], this.failures.editAndReplay(m.id, payload, opts));
  }

  reclassify(list: DlqMessage[], kind: FailureKind): number {
    return this.done(list, this.failures.reclassify(ids(list), kind));
  }

  discard(list: DlqMessage[]): number {
    return this.done(list, this.failures.discard(ids(list)));
  }

  private done(list: DlqMessage[], n: number): number {
    const gone = new Set(ids(list));
    this.selection.update((s) => s.filter((m) => !gone.has(m.id)));
    return n;
  }
}

const ids = (list: DlqMessage[]) => list.map((m) => m.id);
