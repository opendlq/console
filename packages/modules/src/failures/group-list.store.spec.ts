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
  it('counts the messages of the selected groups and replays all of them', () => {
    const { failures, list, pick } = setup();
    pick('schema-amount-type', 'email-null');
    const total = list.messageCount();
    expect(total).toBe(failures.messagesOf('schema-amount-type').length + failures.messagesOf('email-null').length);
    expect(list.replay({ rate: 10 })).toBe(total);
    expect(list.selection()).toEqual([]);
    expect(failures.groups().find((g) => g.key === 'email-null')?.state).toBe('replaying');
  });

  it('discarding a group removes it from the list and clears the selection', () => {
    const { failures, list, pick } = setup();
    pick('email-null');
    expect(list.discard()).toBeGreaterThan(0);
    expect(failures.groups().some((g) => g.key === 'email-null')).toBe(false);
    expect(list.selection()).toEqual([]);
  });

  it('suggests the opposite kind only when every selected group is transient', () => {
    const { list, pick } = setup();
    pick('inventory-timeout', 'fraud-check-rate-limit');
    expect(list.dominantKind()).toBe('transient');
    pick('inventory-timeout', 'email-null');
    expect(list.dominantKind()).toBe('permanent');
  });
});
