import { Injectable, computed, inject, signal } from '@angular/core';
import type { FailureGroup, FailureKind } from '@opendlq/ui';
import { FailuresStore } from './failures.store';

/** Estado da tela "Failures": grupos selecionados e ações em lote sobre todas as mensagens abertas deles. */
@Injectable()
export class GroupListStore {
  private readonly failures = inject(FailuresStore);
  readonly selection = signal<FailureGroup[]>([]);
  readonly messageCount = computed(() => this.selection().reduce((n, g) => n + g.count, 0));
  /** Mensagens abertas dos grupos selecionados (o que o replay vai enviar). */
  readonly messages = computed(() => {
    const keys = new Set(this.selection().map((g) => g.key));
    return this.failures.open().filter((m) => keys.has(m.groupKey));
  });
  /** Destinos possíveis de replay: os tópicos originais dos consumers das mensagens. */
  readonly targets = computed(() => [...new Set(this.messages().map((m) => m.originalTopic))]);
  readonly dominantKind = computed<FailureKind>(() => (this.selection().every((g) => g.kind === 'transient') ? 'transient' : 'permanent'));

  replay(opts: { target?: string; rate?: number } = {}): number {
    return this.run((ids) => this.failures.replay(ids, opts));
  }

  reclassify(kind: FailureKind): number {
    return this.run((ids) => this.failures.reclassify(ids, kind));
  }

  discard(): number {
    return this.run((ids) => this.failures.discard(ids));
  }

  private run(action: (ids: string[]) => number): number {
    const n = action(this.failures.idsOfGroups(this.selection().map((g) => g.key)));
    this.selection.set([]);
    return n;
  }
}
