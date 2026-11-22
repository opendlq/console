import { TestBed } from '@angular/core/testing';
import { FailuresStore } from '../failures/failures.store';
import { BreakersStore } from './breakers.store';

describe('BreakersStore', () => {
  it('conta as mensagens retidas por dependência e destaca os breakers que não estão fechados', () => {
    const store = TestBed.inject(BreakersStore);
    const failures = TestBed.inject(FailuresStore);
    const held = (dep: string) => failures.messages().filter((m) => m.state === 'held' && m.dependency === dep).length;
    for (const v of store.views()) expect(v.held).toBe(held(v.breaker.dependency));
    expect(store.views().find((v) => v.breaker.dependency === 'inventory-service')?.held).toBeGreaterThan(0);
    expect(store.needAttention().every((v) => v.breaker.state !== 'closed')).toBe(true);
    expect(store.needAttention().length).toBe(store.views().filter((v) => v.breaker.state !== 'closed').length);
  });

  it('zera as retidas quando as mensagens saem do estado held', () => {
    const store = TestBed.inject(BreakersStore);
    const failures = TestBed.inject(FailuresStore);
    const ids = failures.messages().filter((m) => m.state === 'held' && m.dependency === 'inventory-service').map((m) => m.id);
    failures.replay(ids);
    expect(store.views().find((v) => v.breaker.dependency === 'inventory-service')?.held).toBe(0);
  });
});
