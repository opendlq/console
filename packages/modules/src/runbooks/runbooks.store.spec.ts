import { TestBed } from '@angular/core/testing';
import { FailuresStore } from '../failures/failures.store';
import { RunbooksStore } from './runbooks.store';

const NAME = 'legacy-sku-format';

describe('RunbooksStore', () => {
  it('aprovar move as mensagens em espera pela ação do runbook e conta uma aprovação', () => {
    const store = TestBed.inject(RunbooksStore);
    const failures = TestBed.inject(FailuresStore);
    const waiting = store.pending(NAME);
    expect(waiting).toBeGreaterThan(0);
    expect(store.approve(NAME)).toBe(waiting);
    expect(store.pending(NAME)).toBe(0);
    expect(failures.messages().filter((m) => m.runbook === NAME && m.state === 'replaying').length).toBe(waiting);
    expect(store.runbooks().find((r) => r.name === NAME)?.approvalsDone).toBe(1);
  });

  it('vira automatic depois da última aprovação exigida, sem passar do exigido', () => {
    const store = TestBed.inject(RunbooksStore);
    store.runbooks.update((l) => l.map((r) => (r.name === NAME ? { ...r, approvalsDone: r.approvalsRequired - 1 } : r)));
    store.approve(NAME);
    const rb = store.runbooks().find((r) => r.name === NAME)!;
    expect([rb.status, rb.approvalsDone]).toEqual(['automatic', rb.approvalsRequired]);
  });

  it('rejeitar devolve as mensagens ao operador e não mexe nas aprovações', () => {
    const store = TestBed.inject(RunbooksStore);
    const failures = TestBed.inject(FailuresStore);
    const waiting = store.pending(NAME);
    expect(store.reject(NAME)).toBe(waiting);
    expect(failures.messages().filter((m) => m.runbook === NAME && m.state === 'awaiting_operator').length).toBe(waiting);
    expect(store.runbooks().find((r) => r.name === NAME)?.approvalsDone).toBe(0);
  });

  it('não faz nada para runbook inexistente ou sem mensagens esperando', () => {
    const store = TestBed.inject(RunbooksStore);
    expect(store.approve('nope')).toBe(0);
    expect(store.approve('drop-test-tenant')).toBe(0);
    expect(store.expiringSoon().map((r) => r.name)).toEqual(['drop-test-tenant']);
  });

  it('conta os runbooks por status', () => {
    const counts = TestBed.inject(RunbooksStore).byStatus();
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(5);
    expect([counts.automatic, counts.supervised, counts.suggested, counts.expired]).toEqual([1, 2, 1, 1]);
  });
});
