import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Token } from './highlight';

/** Uma linha de código realçada. Compartilhada por CodeBlock, CodeEditor e DiffViewer. */
@Component({
  selector: 'odlq-code-line',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@for (t of tokens(); track $index) {<span [class]="'t-' + t.kind">{{ t.text }}</span>}`,
  styles: `
    :host {
      display: block;
      min-height: var(--ui-code-lh, 20px);
      line-height: var(--ui-code-lh, 20px);
      white-space: pre;
    }
    .t-key {
      color: var(--ui-code-key);
    }
    .t-string {
      color: var(--ui-code-string);
    }
    .t-number {
      color: var(--ui-code-number);
    }
    .t-bool {
      color: var(--ui-code-bool);
    }
    .t-punct {
      color: var(--ui-code-punct);
    }
    .t-comment {
      color: var(--ui-text-subtle);
      font-style: italic;
    }
    .t-keyword {
      color: var(--ui-code-key);
      font-weight: 500;
    }
    .t-plain {
      color: var(--ui-code-text);
    }
  `,
})
export class OdlqCodeLine {
  readonly tokens = input.required<Token[]>();
}
