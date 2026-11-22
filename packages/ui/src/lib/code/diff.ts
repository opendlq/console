export interface DiffOp {
  type: 'equal' | 'del' | 'add';
  text: string;
}

/** Diff de linhas por LCS. ponytail: O(n·m) em tempo/memória; trocar por Myers se passar de ~5k linhas. */
export function diffLines(a: string[], b: string[]): DiffOp[] {
  const n = a.length;
  const m = b.length;
  const w = m + 1;
  const lcs = new Uint32Array((n + 1) * w);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i * w + j] = a[i] === b[j] ? lcs[(i + 1) * w + j + 1] + 1 : Math.max(lcs[(i + 1) * w + j], lcs[i * w + j + 1]);
    }
  }
  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: 'equal', text: a[i] });
      i++;
      j++;
    } else if (lcs[(i + 1) * w + j] >= lcs[i * w + j + 1]) {
      ops.push({ type: 'del', text: a[i++] });
    } else {
      ops.push({ type: 'add', text: b[j++] });
    }
  }
  while (i < n) ops.push({ type: 'del', text: a[i++] });
  while (j < m) ops.push({ type: 'add', text: b[j++] });
  return ops;
}

export interface DiffSide {
  /** Número da linha (base 1) no texto original daquele lado. */
  n: number;
  text: string;
}
export interface DiffRow {
  kind: 'equal' | 'change' | 'del' | 'add';
  left?: DiffSide;
  right?: DiffSide;
}

/** Alinha as operações lado a lado: blocos del+add viram linhas `change` pareadas. */
export function alignDiff(ops: DiffOp[]): DiffRow[] {
  const rows: DiffRow[] = [];
  let l = 0;
  let r = 0;
  let i = 0;
  while (i < ops.length) {
    if (ops[i].type === 'equal') {
      rows.push({ kind: 'equal', left: { n: ++l, text: ops[i].text }, right: { n: ++r, text: ops[i].text } });
      i++;
      continue;
    }
    const dels: string[] = [];
    const adds: string[] = [];
    for (; i < ops.length && ops[i].type !== 'equal'; i++) (ops[i].type === 'del' ? dels : adds).push(ops[i].text);
    const paired = Math.min(dels.length, adds.length);
    for (let k = 0; k < paired; k++) {
      rows.push({ kind: 'change', left: { n: ++l, text: dels[k] }, right: { n: ++r, text: adds[k] } });
    }
    for (let k = paired; k < dels.length; k++) rows.push({ kind: 'del', left: { n: ++l, text: dels[k] } });
    for (let k = paired; k < adds.length; k++) rows.push({ kind: 'add', right: { n: ++r, text: adds[k] } });
  }
  return rows;
}

/** Atalho: texto → linhas alinhadas. */
export function diffText(left: string, right: string): DiffRow[] {
  return alignDiff(diffLines(left.split('\n'), right.split('\n')));
}
