import { ChangeDetectionStrategy, Component, computed, input, model, viewChild, type ElementRef } from '@angular/core';
import { OdlqControl, provideControl } from '../form/control';
import { OdlqCodeLine } from './code-line';
import { highlight, type CodeLanguage } from './highlight';

/**
 * Editor de código leve: um `<textarea>` transparente sobre uma camada realçada.
 * ponytail: sem autocomplete/folding/multi-cursor; trocar por CodeMirror 6 se precisar.
 * Obs.: Tab move o foco (acessibilidade), não insere tabulação.
 */
@Component({
  selector: 'odlq-code-editor',
  imports: [OdlqCodeLine],
  providers: [provideControl(() => OdlqCodeEditor)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.--rows]': 'rows()' },
  template: `
    <div class="editor" [class.disabled]="isDisabled()" [class.invalid]="invalid()">
      @if (lineNumbers()) {
        <div class="gutter" aria-hidden="true" #gutter>
          @for (n of numbers(); track n) {
            <div>{{ n }}</div>
          }
        </div>
      }
      <div class="area">
        <div class="hl" aria-hidden="true" #hl>
          @for (line of lines(); track $index) {
            <odlq-code-line [tokens]="line" />
          }
        </div>
        <textarea
          #ta
          spellcheck="false"
          autocapitalize="off"
          autocomplete="off"
          wrap="off"
          [value]="value()"
          [placeholder]="placeholder()"
          [disabled]="isDisabled()"
          [attr.aria-label]="label() || null"
          [attr.aria-invalid]="invalid() || null"
          (input)="commit($any($event.target).value)"
          (scroll)="sync()"
          (blur)="onTouched()"
        ></textarea>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      --ui-code-lh: 20px;
    }
    .editor {
      display: flex;
      height: calc(var(--rows, 8) * var(--ui-code-lh) + 16px);
      overflow: hidden;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-md);
      background: var(--ui-code-bg);
      font: var(--ui-text-sm) / var(--ui-code-lh) var(--ui-font-mono);
      transition:
        border-color var(--ui-transition),
        box-shadow var(--ui-transition);
    }
    .editor:focus-within {
      border-color: var(--ui-primary);
      box-shadow: var(--ui-focus-ring);
    }
    .editor.invalid {
      border-color: var(--ui-danger);
    }
    .editor.disabled {
      opacity: 0.55;
    }
    .gutter {
      flex: none;
      overflow: hidden;
      width: 44px;
      padding: 8px 14px 8px 0;
      color: var(--ui-code-lineno);
      text-align: right;
      user-select: none;
    }
    .gutter div {
      height: var(--ui-code-lh);
    }
    .area {
      position: relative;
      flex: 1;
      min-width: 0;
    }
    .hl,
    textarea {
      position: absolute;
      inset: 0;
      margin: 0;
      padding: 8px 12px;
      border: 0;
      font: inherit;
      line-height: var(--ui-code-lh);
      white-space: pre;
      tab-size: 2;
    }
    .hl {
      overflow: hidden;
      pointer-events: none;
    }
    textarea {
      width: 100%;
      height: 100%;
      resize: none;
      overflow: auto;
      outline: 0;
      background: transparent;
      color: transparent;
      caret-color: var(--ui-text);
    }
    textarea::placeholder {
      color: var(--ui-text-subtle);
    }
    textarea::selection {
      background: var(--ui-primary-soft);
      color: transparent;
    }
  `,
})
export class OdlqCodeEditor extends OdlqControl<string> {
  readonly value = model('');
  readonly language = input<CodeLanguage>('js');
  readonly rows = input(8);
  readonly placeholder = input('');
  readonly lineNumbers = input(false);
  readonly invalid = input(false);
  readonly label = input('Code editor');

  private readonly ta = viewChild.required<ElementRef<HTMLTextAreaElement>>('ta');
  private readonly hl = viewChild.required<ElementRef<HTMLElement>>('hl');
  private readonly gutter = viewChild<ElementRef<HTMLElement>>('gutter');

  // linha final extra: mantém a camada realçada com a mesma altura do textarea
  protected readonly lines = computed(() => highlight(this.value() + '\n', this.language()));
  protected readonly numbers = computed(() => Array.from({ length: this.value().split('\n').length }, (_, i) => i + 1));

  protected sync(): void {
    const { scrollTop, scrollLeft } = this.ta().nativeElement;
    const hl = this.hl().nativeElement;
    hl.scrollTop = scrollTop;
    hl.scrollLeft = scrollLeft;
    const gutter = this.gutter()?.nativeElement;
    if (gutter) gutter.scrollTop = scrollTop;
  }
}
