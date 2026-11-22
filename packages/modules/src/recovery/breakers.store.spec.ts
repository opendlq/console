import { TestBed } from '@angular/core/testing';
import { FailuresStore } from '../failures/failures.store';
import { BreakersStore } from './breakers.store';

describe('BreakersStore', () => {
  it('counts held messages per dependency and flags the breakers that are not closed', () => {
    const store = TestBed.inject(BreakersStore);
    const failures = TestBed.inject(FailuresStore);
    const held = (dep: string) => failures.messages().filter((m) => m.state === 'held' && m.dependency === dep).length;
    for (const v of store.views()) expect(v.held).toBe(held(v.breaker.dependency));
    expect(store.views().find((v) => v.breaker.dependency === 'inventory-service')?.held).toBeGreaterThan(0);
    expect(store.needAttention().every((v) => v.breaker.state !== 'closed')).toBe(true);
    expect(store.needAttention().length).toBe(store.views().filter((v) => v.breaker.state !== 'closed').length);
  });

  it('releases the held count when the messages leave the held state', () => {
    const store = TestBed.inject(BreakersStore);
    const failures = TestBed.inject(FailuresStore);
    const ids = failures.messages().filter((m) => m.state === 'held' && m.dependency === 'inventory-service').map((m) => m.id);
    failures.replay(ids);
    expect(store.views().find((v) => v.breaker.dependency === 'inventory-service')?.held).toBe(0);
  });
});
