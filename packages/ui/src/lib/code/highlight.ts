export type TokenKind = 'key' | 'string' | 'number' | 'bool' | 'punct' | 'comment' | 'keyword' | 'plain';
export interface Token {
  kind: TokenKind;
  text: string;
}
export type CodeLanguage = 'json' | 'properties' | 'js' | 'text';

type Rule = readonly [TokenKind, RegExp];

const JSON_RULES: Rule[] = [
  ['key', /"(?:\\.|[^"\\])*"(?=\s*:)/y],
  ['string', /"(?:\\.|[^"\\])*"/y],
  ['number', /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y],
  ['bool', /\b(?:true|false|null)\b/y],
  ['punct', /[{}[\],:]/y],
];

const JS_RULES: Rule[] = [
  ['comment', /\/\/.*$|#.*$/y],
  ['string', /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/y],
  ['number', /\b\d+(?:\.\d+)?\b/y],
  ['keyword', /\b(?:return|const|let|var|if|else|function|typeof|new|in|of|for|while|true|false|null|undefined)\b/y],
  ['punct', /[{}()[\].,;:=<>!&|+\-*/?]+/y],
];

/** Tokeniza uma linha casando as regras (sticky) na posição corrente; o resto vira `plain`. */
function tokenize(line: string, rules: readonly Rule[]): Token[] {
  const out: Token[] = [];
  const push = (kind: TokenKind, text: string) => {
    const last = out[out.length - 1];
    if (kind === 'plain' && last?.kind === 'plain') last.text += text;
    else out.push({ kind, text });
  };
  let i = 0;
  while (i < line.length) {
    let matched = false;
    for (const [kind, re] of rules) {
      re.lastIndex = i;
      const m = re.exec(line);
      if (m && m[0].length > 0) {
        push(kind, m[0]);
        i += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      push('plain', line[i]);
      i++;
    }
  }
  return out;
}

function tokenizeProperty(line: string): Token[] {
  if (/^\s*[#!]/.test(line)) return [{ kind: 'comment', text: line }];
  const m = /^(\s*)([^=:\s][^=:]*?)(\s*[=:]\s*)(.*)$/.exec(line);
  if (!m) return line ? [{ kind: 'plain', text: line }] : [];
  const [, indent, key, sep, value] = m;
  const valueKind: TokenKind = /^-?\d+(\.\d+)?$/.test(value) ? 'number' : value === 'true' || value === 'false' ? 'bool' : 'string';
  const out: Token[] = [];
  if (indent) out.push({ kind: 'plain', text: indent });
  out.push({ kind: 'key', text: key }, { kind: 'punct', text: sep });
  if (value) out.push({ kind: valueKind, text: value });
  return out;
}

/** Realça `code` e devolve um array de linhas, cada uma com seus tokens. */
export function highlight(code: string, lang: CodeLanguage): Token[][] {
  return code.split('\n').map((line) => {
    switch (lang) {
      case 'json':
        return tokenize(line, JSON_RULES);
      case 'js':
        return tokenize(line, JS_RULES);
      case 'properties':
        return tokenizeProperty(line);
      default:
        return line ? [{ kind: 'plain' as const, text: line }] : [];
    }
  });
}
