import { compact, niceScale } from './chart-utils';

describe('niceScale', () => {
  it('arredonda o máximo para um passo legível e inclui o zero', () => {
    const { max, ticks } = niceScale(3.1, 3);
    expect(ticks[0]).toBe(0);
    expect(max).toBeGreaterThanOrEqual(3.1);
    expect(ticks.at(-1)).toBe(max);
  });

  it('passos de 1/2/2.5/5', () => {
    expect(niceScale(100, 4).ticks).toEqual([0, 25, 50, 75, 100]);
    expect(niceScale(10, 5).ticks).toEqual([0, 2, 4, 6, 8, 10]);
  });

  it('máximo 0 não quebra', () => {
    expect(niceScale(0, 4).max).toBeGreaterThan(0);
  });
});

describe('compact', () => {
  it('formata milhares e milhões', () => {
    expect(compact(1500)).toBe('1.5K');
    expect(compact(200_000_000)).toBe('200M');
  });
});
