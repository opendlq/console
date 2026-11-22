import { formatAge, funnel, groupMessages, isOpen, messageHistory, prettyPayload, selfRecoveryRate, type DlqMessage } from './domain';

const msg = (over: Partial<DlqMessage>): DlqMessage =>
  ({
    id: 'x', receivedAt: '', ageMin: 10, sourceTopic: '', partition: 0, offset: 0, originalTopic: 't', partitionKey: 'k', payload: '', headers: {},
    consumer: 'c', kind: 'permanent', reason: 'r', groupKey: 'g', classifiedBy: 'rule', state: 'awaiting_operator', attempts: [], expiresAt: '',
    enrichment: { status: 'skipped', logs: [] }, ...over,
  }) as DlqMessage;

describe('domain', () => {
  it('formata a idade em m, h e d', () => {
    expect([formatAge(0.2), formatAge(45), formatAge(90), formatAge(120), formatAge(3000)]).toEqual(['<1m', '45m', '1h 30m', '2h', '2d 2h']);
  });

  it('agrupa só mensagens abertas, conta por estado e tendência por hora', () => {
    const groups = groupMessages([
      msg({ id: '1', ageMin: 10 }),
      msg({ id: '2', ageMin: 130, state: 'retrying' }),
      msg({ id: '3', ageMin: 130, state: 'recovered' }),
      msg({ id: '4', groupKey: 'h', ageMin: 5000 }),
    ]);
    const g = groups.find((x) => x.key === 'g')!;
    expect([g.count, g.oldestMin, g.states.awaiting_operator, g.states.retrying]).toEqual([2, 130, 1, 1]);
    expect(g.trend[11]).toBe(1);
    expect(g.trend[9]).toBe(1);
    expect(groups.find((x) => x.key === 'h')!.trend.every((n) => n === 0)).toBe(true);
  });

  it('marca o tipo do grupo como unknown quando as mensagens divergem', () => {
    expect(groupMessages([msg({ id: '1' }), msg({ id: '2', kind: 'transient' })])[0].kind).toBe('unknown');
  });

  it('monta o funil e a taxa de auto-recuperação só com as fechadas', () => {
    const rows = funnel([
      msg({ state: 'recovered', resolvedBy: 'self' }),
      msg({ state: 'recovered', resolvedBy: 'self' }),
      msg({ state: 'recovered', resolvedBy: 'operator' }),
      msg({ state: 'discarded' }),
      msg({ state: 'held' }),
    ]);
    const n = (k: string) => rows.find((r) => r.key === k)!.count;
    expect([n('self'), n('operator'), n('discarded'), n('open')]).toEqual([2, 1, 1, 1]);
    expect(selfRecoveryRate(rows)).toBe(50);
    expect(selfRecoveryRate(funnel([]))).toBe(0);
    expect(isOpen('discarded')).toBe(false);
  });

  it('indenta payload JSON e devolve o texto original quando não é JSON', () => {
    expect(prettyPayload('{"a":1}')).toBe('{\n  "a": 1\n}');
    expect(prettyPayload('[binary] 00 01')).toBe('[binary] 00 01');
  });

  it('deriva o histórico base do estado, com horários a partir de receivedAt', () => {
    const at = '2026-11-22 11:00:00';
    expect(messageHistory(msg({ receivedAt: at, state: 'received' })).map((t) => t.to)).toEqual(['received']);
    expect(messageHistory(msg({ receivedAt: at, state: 'enriched' })).map((t) => t.to)).toEqual(['received', 'enriched']);
    const full = messageHistory(msg({ receivedAt: at, state: 'held' }));
    expect(full.map((t) => t.to)).toEqual(['received', 'enriched', 'held']);
    expect(full.map((t) => t.at)).toEqual(['2026-11-22 11:00:00', '2026-11-22 11:00:03', '2026-11-22 11:00:06']);
    expect(messageHistory(msg({ receivedAt: at, state: 'recovered' })).at(-1)!.to).toBe('awaiting_operator');
  });
});
