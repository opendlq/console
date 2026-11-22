import { PARKED_ALERT_THRESHOLD, TopicsStore, topicHealth } from './topics.store';
import type { DlqTopic } from './topics.data';

const topic = (over: Partial<DlqTopic>): DlqTopic => ({ name: 't.dlq', sourceTopic: 't', partitions: 1, deadLetters: 0, parked: 0, oldest: '—', ...over });

describe('topicHealth', () => {
  it('vazio → resolved', () => expect(topicHealth(topic({}))).toBe('resolved'));
  it('com dead letters → retrying', () => expect(topicHealth(topic({ deadLetters: 3 }))).toBe('retrying'));
  it('parked acima do limite → parked', () => {
    expect(topicHealth(topic({ deadLetters: 9, parked: PARKED_ALERT_THRESHOLD + 1 }))).toBe('parked');
    expect(topicHealth(topic({ deadLetters: 9, parked: PARKED_ALERT_THRESHOLD }))).toBe('retrying');
  });
});

describe('TopicsStore', () => {
  it('filtra por nome sem diferenciar maiúsculas e ignora espaços', () => {
    const s = new TopicsStore();
    s.query.set('  PAYMENTS ');
    expect(s.rows().map((t) => t.name)).toEqual(['payments.dlq']);
  });

  it('busca vazia devolve todos', () => {
    const s = new TopicsStore();
    expect(s.rows()).toHaveLength(s.topics().length);
  });

  it('find devolve o tópico ou undefined', () => {
    const s = new TopicsStore();
    expect(s.find('orders.dlq')?.sourceTopic).toBe('orders.created');
    expect(s.find('nope')).toBeUndefined();
  });
});
