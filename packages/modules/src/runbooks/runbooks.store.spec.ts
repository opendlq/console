import { TestBed } from '@angular/core/testing';
import { FailuresStore } from '../failures/failures.store';
import { RunbooksStore } from './runbooks.store';

const NAME = 'legacy-sku-format';

describe('RunbooksStore', () => {
  it('approving moves the waiting messages by the runbook action and counts one approval', () => {
    const store = TestBed.inject(RunbooksStore);
    const failures = TestBed.inject(FailuresStore);
    const waiting = store.pending(NAME);
    expect(waiting).toBeGreaterThan(0);
    expect(store.approve(NAME)).toBe(waiting);
    expect(store.pending(NAME)).toBe(0);
    expect(failures.messages().filter((m) => m.runbook === NAME && m.state === 'replaying').length).toBe(waiting);
    expect(store.runbooks().find((r) => r.name === NAME)?.approvalsDone).toBe(1);
  });

  it('becomes automatic after the last required approval, and approvals never exceed the requirement', () => {
    const store = TestBed.inject(RunbooksStore);
    store.runbooks.update((l) => l.map((r) => (r.name === NAME ? { ...r, approvalsDone: r.approvalsRequired - 1 } : r)));
    store.approve(NAME);
    const rb = store.runbooks().find((r) => r.name === NAME)!;
    expect([rb.status, rb.approvalsDone]).toEqual(['automatic', rb.approvalsRequired]);
  });

  it('rejecting sends the messages back to the operator and leaves the approvals untouched', () => {
    const store = TestBed.inject(RunbooksStore);
    const failures = TestBed.inject(FailuresStore);
    const waiting = store.pending(NAME);
    expect(store.reject(NAME)).toBe(waiting);
    expect(failures.messages().filter((m) => m.runbook === NAME && m.state === 'awaiting_operator').length).toBe(waiting);
    expect(store.runbooks().find((r) => r.name === NAME)?.approvalsDone).toBe(0);
  });

  it('does nothing for an unknown runbook or when nothing is waiting', () => {
    const store = TestBed.inject(RunbooksStore);
    expect(store.approve('nope')).toBe(0);
    expect(store.approve('drop-test-tenant')).toBe(0);
    expect(store.expiringSoon().map((r) => r.name)).toEqual(['drop-test-tenant', 'ledger-reconcile-route']);
  });
});
