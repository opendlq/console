import { Injectable, computed, inject, signal } from '@angular/core';
import { BREAKERS, type Breaker } from '@opendlq/ui';
import { FailuresStore } from '../failures/failures.store';

export interface BreakerView {
  breaker: Breaker;
  /** Mensagens em `held` por causa deste breaker. */
  held: number;
}

/** Circuit breakers por dependência. Só leitura: a configuração vive em `Policy` (declarativa, `opendlq apply`). */
@Injectable({ providedIn: 'root' })
export class BreakersStore {
  private readonly failures = inject(FailuresStore);
  /** ponytail: dados de exemplo; troque por chamadas à API do OpenDLQ. */
  readonly breakers = signal<Breaker[]>(BREAKERS);

  readonly views = computed<BreakerView[]>(() => {
    const held = new Map<string, number>();
    for (const m of this.failures.messages()) {
      if (m.state === 'held' && m.dependency) held.set(m.dependency, (held.get(m.dependency) ?? 0) + 1);
    }
    return this.breakers().map((breaker) => ({ breaker, held: held.get(breaker.dependency) ?? 0 }));
  });
  readonly needAttention = computed(() => this.views().filter((v) => v.breaker.state !== 'closed'));
}
