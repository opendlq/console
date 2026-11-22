import { TestBed } from '@angular/core/testing';
import { AuditStore } from '../audit/audit.store';
import { FailuresStore } from './failures.store';

const setup = () => ({ store: TestBed.inject(FailuresStore), audit: TestBed.inject(AuditStore) });
const idsOf = (store: FailuresStore, key: string) => store.messagesOf(key).map((m) => m.id);

describe('FailuresStore', () => {
  it('agrupa só as mensagens abertas por causa, da maior para a menor', () => {
    const { store } = setup();
    const groups = store.groups();
    expect(groups.reduce((n, g) => n + g.count, 0)).toBe(store.open().length);
    expect(groups.map((g) => g.count)).toEqual([...groups.map((g) => g.count)].sort((a, b) => b - a));
    expect(store.funnel().find((r) => r.key === 'open')?.count).toBe(store.open().length);
  });

  it('filtra os grupos por texto, consumer, tipo e estado, e limpa os filtros', () => {
    const { store } = setup();
    const all = store.visibleGroups().length;
    store.consumer.set('user-events');
    expect(store.visibleGroups().every((g) => g.consumer === 'user-events')).toBe(true);
    store.consumer.set(null);
    store.kind.set('transient');
    expect(store.visibleGroups().every((g) => g.kind === 'transient')).toBe(true);
    store.state.set('held');
    expect(store.visibleGroups().every((g) => !!g.states.held)).toBe(true);
    store.query.set('inventory');
    expect(store.visibleGroups().map((g) => g.key)).toEqual(['inventory-timeout']);
    expect(store.filtering()).toBe(true);
    store.clearFilters();
    expect(store.visibleGroups().length).toBe(all);
    expect(store.filtering()).toBe(false);
  });

  it('faz replay das mensagens abertas, ignora as fechadas e registra uma entrada de auditoria', () => {
    const { store, audit } = setup();
    const ids = idsOf(store, 'schema-amount-type');
    const before = audit.entries().length;
    expect(store.replay(ids, { rate: 20 })).toBe(ids.length);
    expect(store.messagesOf('schema-amount-type').every((m) => m.state === 'replaying')).toBe(true);
    const entry = audit.entries()[0];
    expect([entry.action, entry.target, entry.count, entry.to]).toEqual(['replay', 'group:schema-amount-type', ids.length, 'replaying']);
    expect(audit.entries().length).toBe(before + 1);
    store.discard([ids[0]]);
    expect(store.replay([ids[0]])).toBe(0);
  });

  it('reclassifica: transitório volta a retrying, permanente espera um operador', () => {
    const { store } = setup();
    const [id] = idsOf(store, 'schema-amount-type');
    store.reclassify([id], 'transient');
    const m = store.messages().find((x) => x.id === id)!;
    expect([m.state, m.kind, m.classifiedBy]).toEqual(['retrying', 'transient', 'operator']);
    store.reclassify([id], 'permanent');
    expect(store.messages().find((x) => x.id === id)!.state).toBe('awaiting_operator');
  });

  it('edita o payload e reenvia com o mesmo id; o histórico mostra a ação primeiro', () => {
    const { store } = setup();
    const m = store.messagesOf('schema-amount-type')[0];
    expect(store.editAndReplay(m.id, '{"amount":10}')).toBe(1);
    const after = store.messages().find((x) => x.id === m.id)!;
    expect([after.payload, after.state]).toEqual(['{"amount":10}', 'replaying']);
    expect(store.historyOf(after)[0].action).toBe('edit and replay');
  });

  it('descartar todas as mensagens de um grupo remove o grupo', () => {
    const { store } = setup();
    store.discard(idsOf(store, 'email-null'));
    expect(store.groups().some((g) => g.key === 'email-null')).toBe(false);
  });

  it('conta as chegadas por hora nas últimas 12 horas', () => {
    const { store } = setup();
    const arrivals = store.arrivalsPerHour();
    expect(arrivals).toHaveLength(12);
    expect(arrivals.reduce((a, b) => a + b, 0)).toBe(store.messages().filter((m) => m.ageMin < 720).length);
  });
});
