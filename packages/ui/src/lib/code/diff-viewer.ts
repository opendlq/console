import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { OdlqBadge } from '../badge/badge';
import { OdlqCodeLine } from './code-line';
import { diffText, type DiffSide } from './diff';
import { highlight, type CodeLanguage } from './highlight';

/** Comparação lado a lado (ex.: versões de schema), com linhas removidas/adicionadas destacadas. */
@Component({
  selector: 'odlq-diff-viewer',
  imports: [OdlqCodeLine, OdlqBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="head">
      <div class="side">
        <span class="title">{{ leftTitle() }}</span>
        @if (leftMeta()) {
          <odlq-badge tone="info" mono>{{ leftMeta() }}</odlq-badge>
        }
      </div>
      <div class="side">
        <span class="title">{{ rightTitle() }}</span>
        @if (rightMeta()) {
          <odlq-badge tone="info" mono>{{ rightMeta() }}</odlq-badge>
        }
      </div>
    </div>
    <div class="scroll" role="region" tabindex="0" aria-label="Diff" [style.max-height]="maxHeight()">
      @for (row of rows(); track $index) {
        <div class="row" [attr.data-kind]="row.kind">
          <div class="cell left" [class.del]="row.kind === 'change' || row.kind === 'del'" [class.pad]="!row.left">
            <span class="ln" aria-hidden="true">{{ row.left?.n }}</span>
            <span class="sign" aria-hidden="true">{{ row.left && row.kind !== 'equal' ? '−' : '' }}</span>
            @if (row.left) {
              <odlq-code-line [tokens]="tokensOf(leftLines(), row.left)" />
              @if (row.kind !== 'equal') {
                <span class="sr">removed</span>
              }
            }
          </div>
          <div class="cell right" [class.add]="row.kind === 'change' || row.kind === 'add'" [class.pad]="!row.right">
            <span class="ln" aria-hidden="true">{{ row.right?.n }}</span>
            <span class="sign" aria-hidden="true">{{ row.right && row.kind !== 'equal' ? '+' : '' }}</span>
            @if (row.right) {
              <odlq-code-line [tokens]="tokensOf(rightLines(), row.right)" />
              @if (row.kind !== 'equal') {
                <span class="sr">added</span>
              }
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      overflow: hidden;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-md);
      background: var(--ui-code-bg);
      font: var(--ui-text-sm) / 20px var(--ui-font-mono);
      --ui-code-lh: 20px;
    }
    .head,
    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    .head {
      border-bottom: 1px solid var(--ui-border);
      background: var(--ui-surface-muted);
    }
    .side {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      font-family: var(--ui-font-sans);
    }
    .title {
      color: var(--ui-text-muted);
      font-size: var(--ui-text-xs);
      font-family: var(--ui-font-mono);
      letter-spacing: 0.04em;
    }
    .scroll {
      overflow: auto;
    }
    .cell {
      display: flex;
      min-width: 0;
      overflow: hidden;
    }
    .cell.right {
      border-left: 1px solid var(--ui-border);
    }
    .cell.del {
      background: var(--ui-diff-del);
    }
    .cell.add {
      background: var(--ui-diff-add);
    }
    .cell.pad {
      background: var(--ui-surface-hover);
    }
    .ln {
      flex: none;
      width: 36px;
      padding-right: 10px;
      color: var(--ui-code-lineno);
      text-align: right;
      user-select: none;
    }
    .sign {
      flex: none;
      width: 16px;
      color: var(--ui-text-muted);
      text-align: center;
      user-select: none;
    }
    .sr {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }
  `,
})
export class OdlqDiffViewer {
  readonly left = input.required<string>();
  readonly right = input.required<string>();
  readonly leftTitle = input('Previous');
  readonly rightTitle = input('Current');
  /** Texto de apoio ao lado do título (ex.: "Schema ID: 100123"). */
  readonly leftMeta = input('');
  readonly rightMeta = input('');
  readonly language = input<CodeLanguage>('json');
  readonly maxHeight = input<string | null>(null);

  protected readonly rows = computed(() => diffText(this.left(), this.right()));
  protected readonly leftLines = computed(() => highlight(this.left(), this.language()));
  protected readonly rightLines = computed(() => highlight(this.right(), this.language()));

  protected tokensOf(lines: ReturnType<typeof highlight>, side: DiffSide) {
    return lines[side.n - 1] ?? [];
  }
}
