import { TestBed } from '@angular/core/testing';
import { GroupViewStore } from './group-view.store';

const setup = (key = 'schema-amount-type') => {
  TestBed.configureTestingModule({ providers: [GroupViewStore] });
  const view = TestBed.inject(GroupViewStore);
  view.key.set(key);
  return view;
};

describe('GroupViewStore', () => {
  it('lists the open messages of the group and filters them by text', () => {
    const view = setup();
    expect(view.messages().every((m) => m.groupKey === 'schema-amount-type')).toBe(true);
    expect(view.group()?.count).toBe(view.messages().length);
    view.query.set(view.messages()[0].partitionKey);
    expect(view.visible().map((m) => m.partitionKey)).toContain(view.messages()[0].partitionKey);
    expect(view.visible().length).toBeLessThan(view.messages().length);
  });

  it('keeps the active message after it is discarded, with its new state, and drops it from the selection', () => {
    const view = setup();
    const m = view.messages()[0];
    view.activeId.set(m.id);
    view.selection.set([m, view.messages()[1]]);
    expect(view.discard([m])).toBe(1);
    expect(view.active()?.state).toBe('discarded');
    expect(view.selection().map((x) => x.id)).not.toContain(m.id);
    expect(view.messages().some((x) => x.id === m.id)).toBe(false);
  });

  it('offers the original topics of the consumer as replay targets', () => {
    expect(setup().targets()).toEqual(['payments.transactions']);
  });
});
