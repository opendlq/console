import { alignDiff, diffLines, diffText } from './diff';

describe('diffLines', () => {
  it('textos iguais: só equal', () => {
    expect(diffLines(['a', 'b'], ['a', 'b']).map((o) => o.type)).toEqual(['equal', 'equal']);
  });

  it('detecta remoção, adição e troca', () => {
    const ops = diffLines(['a', 'b', 'c'], ['a', 'x', 'c', 'd']);
    expect(ops.map((o) => `${o.type}:${o.text}`)).toEqual(['equal:a', 'del:b', 'add:x', 'equal:c', 'add:d']);
  });

  it('lida com lados vazios', () => {
    expect(diffLines([], ['a']).map((o) => o.type)).toEqual(['add']);
    expect(diffLines(['a'], []).map((o) => o.type)).toEqual(['del']);
  });
});

describe('alignDiff', () => {
  it('pareia del+add na mesma linha (change) e numera cada lado', () => {
    const rows = diffText('a\nb\nc', 'a\nB\nc');
    expect(rows.map((r) => r.kind)).toEqual(['equal', 'change', 'equal']);
    expect(rows[1].left).toEqual({ n: 2, text: 'b' });
    expect(rows[1].right).toEqual({ n: 2, text: 'B' });
  });

  it('adição pura deixa o lado esquerdo vazio e mantém a numeração', () => {
    const rows = alignDiff(diffLines(['a', 'c'], ['a', 'b', 'c']));
    expect(rows.map((r) => r.kind)).toEqual(['equal', 'add', 'equal']);
    expect(rows[1].left).toBeUndefined();
    expect(rows[2].left?.n).toBe(2);
    expect(rows[2].right?.n).toBe(3);
  });

  it('blocos desiguais: sobra vira del/add', () => {
    const rows = diffText('x\ny\nz', 'q');
    expect(rows.map((r) => r.kind)).toEqual(['change', 'del', 'del']);
  });
});
