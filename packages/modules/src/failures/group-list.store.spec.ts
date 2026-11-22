import { TestBed } from '@angular/core/testing';
import { FailuresStore } from './failures.store';
import { GroupListStore } from './group-list.store';

const setup = () => {
  TestBed.configureTestingModule({ providers: [GroupListStore] });
  const failures = TestBed.inject(FailuresStore);
  const list = TestBed.inject(GroupListStore);
  const pick = (...keys: string[]) => list.selection.set(failures.groups().filter((g) => keys.includes(g.key)));
  return { failures, list, pick };
};

describe('GroupListStore', () => {
  it('conta as mensagens dos grupos selecionados e faz replay de todas', () => {
    const { failures, list, pick } = setup();
    pick('schema-amount-type', 'email-null');
    const total = list.messageCount();
    expect(total).toBe(failures.messagesOf('schema-amount-type').length + failures.messagesOf('email-null').length);
    expect(list.replay({ rate: 10 })).toBe(total);
    expect(list.selection()).toEqual([]);
    expect(failures.groups().find((g) => g.key === 'email-null')?.state).toBe('replaying');
  });

  it('descartar um grupo o tira da lista e limpa a seleção', () => {
    const { failures, list, pick } = setup();
    pick('email-null');
    expect(list.discard()).toBeGreaterThan(0);
    expect(failures.groups().some((g) => g.key === 'email-null')).toBe(false);
    expect(list.selection()).toEqual([]);
  });

  it('só trata a seleção como transitória quando todos os grupos são transitórios', () => {
    const { list, pick } = setup();
    pick('inventory-timeout', 'fraud-check-rate-limit');
    expect(list.dominantKind()).toBe('transient');
    pick('inventory-timeout', 'email-null');
    expect(list.dominantKind()).toBe('permanent');
  });

  it('lista as mensagens abertas dos grupos selecionados e os destinos de replay', () => {
    const { failures, list, pick } = setup();
    pick('schema-amount-type', 'email-null');
    expect(list.messages().length).toBe(list.messageCount());
    expect(list.targets()).toEqual(['payments.transactions', 'user-registrations']);
    expect(failures.open().length).toBeGreaterThan(list.messages().length);
  });
});
