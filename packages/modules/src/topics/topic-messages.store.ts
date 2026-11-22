import { Injectable, computed, signal } from '@angular/core';
import { DLQ_MESSAGES, type DlqMessage, type DlqStatus, type OdlqAppliedFilter, type OdlqJsFilter } from '@opendlq/ui';

/**
 * Estado da tela de mensagens de um tópico DLQ. Não é `providedIn: 'root'`: cada página o provê
 * (`providers: [TopicMessagesStore]`) para ter estado próprio.
 */
@Injectable()
export class TopicMessagesStore {
  /** ponytail: dados de exemplo; troque por chamadas à API do seu cluster. */
  readonly messages = signal<DlqMessage[]>(DLQ_MESSAGES);
  readonly query = signal('');
  readonly selection = signal<DlqMessage[]>([]);
  readonly active = signal<DlqMessage | null>(null);
  readonly filters = signal<OdlqAppliedFilter[]>([]);

  readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? this.messages().filter((m) => `${m.key} ${m.value} ${m.errorClass}`.toLowerCase().includes(q)) : this.messages();
  });
  readonly parked = this.countOf('parked');
  readonly retrying = this.countOf('retrying');
  readonly resolved = this.countOf('resolved');

  private filterSeq = 0;

  addFilter(f: OdlqJsFilter): void {
    // ponytail: filtros JS ficam só como chips; avalie-os no servidor (nunca `new Function` sobre entrada do usuário).
    this.filters.update((l) => [...l, { id: `js-${++this.filterSeq}`, kind: 'js', label: f.name }]);
  }

  removeFilter(id: string): void {
    this.filters.update((l) => l.filter((f) => f.id !== id));
  }

  clearFilters(): void {
    this.filters.set([]);
  }

  /** Marca as mensagens como `retrying`. Devolve quantas foram enviadas. */
  reprocess(list: DlqMessage[]): number {
    const ids = new Set(list.map((m) => m.id));
    this.messages.update((l) => l.map((m) => (ids.has(m.id) ? { ...m, status: 'retrying' } : m)));
    return list.length;
  }

  reprocessSelected(): number {
    const n = this.reprocess(this.selection());
    this.selection.set([]);
    return n;
  }

  /** Remove as mensagens selecionadas. Devolve quantas foram descartadas. */
  discardSelected(): number {
    const gone = new Set(this.selection().map((m) => m.id));
    this.messages.update((l) => l.filter((m) => !gone.has(m.id)));
    if (this.active() && gone.has(this.active()!.id)) this.active.set(null);
    this.selection.set([]);
    return gone.size;
  }

  /** Tópicos possíveis para reprocessar: o de origem do DLQ mais os de origem das mensagens. */
  destinations(sourceTopic?: string): string[] {
    return [...new Set([sourceTopic, ...this.messages().map((m) => m.originalTopic)])].filter((t): t is string => !!t);
  }

  private countOf(status: DlqStatus) {
    return computed(() => this.messages().filter((m) => m.status === status).length);
  }
}
