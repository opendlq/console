import { TestBed } from '@angular/core/testing';
import { AuditStore } from './audit.store';

describe('AuditStore', () => {
  it('registra a entrada no topo, com o operador logado e resultado ok por padrão', () => {
    const audit = TestBed.inject(AuditStore);
    const before = audit.entries().length;
    const e = audit.record({ action: 'replay', target: 'group:x', count: 2 });
    expect([e.actor, e.by, e.result]).toEqual(['person', audit.operator, 'ok']);
    expect(audit.entries()[0]).toBe(e);
    expect(audit.entries().length).toBe(before + 1);
  });

  it('respeita ator e resultado informados e filtra por tipo de ator', () => {
    const audit = TestBed.inject(AuditStore);
    audit.record({ action: 'approve', target: 'runbook:x', actor: 'runbook', by: 'x@1', result: 'failed', messageId: 'm1' });
    expect(audit.forMessage('m1')[0].result).toBe('failed');
    audit.actor.set('runbook');
    expect(audit.visible().every((e) => e.actor === 'runbook')).toBe(true);
    audit.actor.set(null);
    expect(audit.visible()).toBe(audit.entries());
  });
});
