import { highlight } from './highlight';

const kinds = (code: string, lang: Parameters<typeof highlight>[1]) =>
  highlight(code, lang)[0].map((t) => `${t.kind}:${t.text}`);

describe('highlight', () => {
  it('json: separa chave, string, número e booleano', () => {
    expect(kinds('  "a": "x", "n": -1.5e3, "ok": true', 'json')).toEqual([
      'plain:  ',
      'key:"a"',
      'punct::',
      'plain: ',
      'string:"x"',
      'punct:,',
      'plain: ',
      'key:"n"',
      'punct::',
      'plain: ',
      'number:-1.5e3',
      'punct:,',
      'plain: ',
      'key:"ok"',
      'punct::',
      'plain: ',
      'bool:true',
    ]);
  });

  it('json: aspas escapadas ficam dentro da string', () => {
    expect(kinds('"say \\"hi\\""', 'json')).toEqual(['string:"say \\"hi\\""']);
  });

  it('properties: chave=valor, comentário e tipos de valor', () => {
    expect(kinds('retention.ms=604800000', 'properties')).toEqual(['key:retention.ms', 'punct:=', 'number:604800000']);
    expect(kinds('cleanup.policy=delete', 'properties')).toEqual(['key:cleanup.policy', 'punct:=', 'string:delete']);
    expect(kinds('preallocate=false', 'properties')).toEqual(['key:preallocate', 'punct:=', 'bool:false']);
    expect(kinds('# comentário', 'properties')).toEqual(['comment:# comentário']);
  });

  it('js: comentário, string, palavra-chave', () => {
    expect(kinds('return record.key == "a" // ok', 'js')).toEqual([
      'keyword:return',
      'plain: record',
      'punct:.',
      'plain:key ',
      'punct:==',
      'plain: ',
      'string:"a"',
      'plain: ',
      'comment:// ok',
    ]);
  });

  it('devolve uma lista de tokens por linha, inclusive vazias', () => {
    const lines = highlight('{\n\n}', 'json');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toEqual([]);
  });
});
