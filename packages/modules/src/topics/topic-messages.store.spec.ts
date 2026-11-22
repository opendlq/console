import type { DlqMessage } from '@opendlq/ui';
import { TopicMessagesStore } from './topic-messages.store';

const msg = (id: string, over: Partial<DlqMessage> = {}): DlqMessage =>
  ({ id, key: `key-${id}`, value: '{}', errorClass: 'TimeoutException', originalTopic: 'orders.created', status: 'pending', ...over }) as DlqMessage;

function store(list: DlqMessage[]): TopicMessagesStore {
  const s = new TopicMessagesStore();
  s.messages.set(list);
  return s;
}

describe('TopicMessagesStore', () => {
  it('busca por chave, valor ou classe de erro', () => {
    const s = store([msg('1'), msg('2', { errorClass: 'SchemaValidationException' })]);
    s.query.set('schemavalidation');
    expect(s.visible().map((m) => m.id)).toEqual(['2']);
    s.query.set('');
    expect(s.visible()).toHaveLength(2);
  });

  it('conta mensagens por status', () => {
    const s = store([msg('1', { status: 'parked' }), msg('2', { status: 'retrying' }), msg('3', { status: 'parked' })]);
    expect([s.parked(), s.retrying(), s.resolved()]).toEqual([2, 1, 0]);
  });

  it('reprocess marca como retrying só as mensagens informadas', () => {
    const s = store([msg('1'), msg('2')]);
    expect(s.reprocess([s.messages()[0]])).toBe(1);
    expect(s.messages().map((m) => m.status)).toEqual(['retrying', 'pending']);
  });

  it('reprocessSelected reprocessa e limpa a seleção', () => {
    const s = store([msg('1'), msg('2')]);
    s.selection.set(s.messages());
    expect(s.reprocessSelected()).toBe(2);
    expect(s.selection()).toEqual([]);
    expect(s.retrying()).toBe(2);
  });

  it('discardSelected remove as selecionadas, limpa a seleção e fecha a ativa descartada', () => {
    const s = store([msg('1'), msg('2'), msg('3')]);
    s.selection.set([s.messages()[0], s.messages()[1]]);
    s.active.set(s.messages()[0]);
    expect(s.discardSelected()).toBe(2);
    expect(s.messages().map((m) => m.id)).toEqual(['3']);
    expect(s.selection()).toEqual([]);
    expect(s.active()).toBeNull();
  });

  it('discardSelected preserva a ativa que não foi descartada', () => {
    const s = store([msg('1'), msg('2')]);
    s.active.set(s.messages()[1]);
    s.selection.set([s.messages()[0]]);
    s.discardSelected();
    expect(s.active()?.id).toBe('2');
  });

  it('filtros: adiciona com ids únicos, remove e limpa', () => {
    const s = store([]);
    s.addFilter({ name: 'Paris', code: 'true' });
    s.addFilter({ name: 'Berlin', code: 'true' });
    const [a, b] = s.filters();
    expect(a.id).not.toBe(b.id);
    expect(s.filters().map((f) => f.label)).toEqual(['Paris', 'Berlin']);
    s.removeFilter(a.id);
    expect(s.filters().map((f) => f.label)).toEqual(['Berlin']);
    s.clearFilters();
    expect(s.filters()).toEqual([]);
  });

  it('destinations: origem do DLQ + origens das mensagens, sem repetir nem vazios', () => {
    const s = store([msg('1', { originalTopic: 'orders.created' }), msg('2', { originalTopic: 'users.registrations' })]);
    expect(s.destinations('orders.created')).toEqual(['orders.created', 'users.registrations']);
    expect(s.destinations()).toEqual(['orders.created', 'users.registrations']);
  });
});
