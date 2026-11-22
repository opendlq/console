import { Injectable, computed, signal } from '@angular/core';
import type { DlqStatus } from '@opendlq/ui';
import { DLQ_TOPICS, type DlqTopic } from './topics.data';

/** Acima disso, o tópico é considerado com mensagens "parked" (retentativas esgotadas). */
export const PARKED_ALERT_THRESHOLD = 500;

/** Saúde de um tópico DLQ: muitas parked → `parked`; ainda há dead letters → `retrying`; vazio → `resolved`. */
export function topicHealth(t: DlqTopic): DlqStatus {
  return t.parked > PARKED_ALERT_THRESHOLD ? 'parked' : t.deadLetters > 0 ? 'retrying' : 'resolved';
}

/** Lista de tópicos DLQ com busca por nome. */
@Injectable({ providedIn: 'root' })
export class TopicsStore {
  readonly topics = signal<DlqTopic[]>(DLQ_TOPICS);
  readonly query = signal('');
  readonly rows = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.topics().filter((t) => t.name.toLowerCase().includes(q));
  });

  find(name: string): DlqTopic | undefined {
    return this.topics().find((t) => t.name === name);
  }
}
