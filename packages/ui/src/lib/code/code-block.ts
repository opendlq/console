import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, signal } from '@angular/core';
import { OdlqIconButton } from '../button/icon-button';
import { OdlqCodeLine } from './code-line';
import { highlight, type CodeLanguage } from './highlight';

/** Bloco de código somente leitura: realce, numeração de linhas e botão copiar. */
@Component({
  selector: 'odlq-code-block',
  imports: [OdlqCodeLine, OdlqIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (copyable()) {
      <button
        odlq-icon-button
        size="sm"
        variant="outline"
        class="copy"
        [icon]="copied() ? 'check' : 'copy'"
        [label]="copied() ? 'Copied' : 'Copy to clipboard'"
        (click)="copy()"
      ></button>
    }
    <div class="scroll" tabindex="0" role="region" [attr.aria-label]="label()" [style.max-height]="maxHeight()">
      <div class="lines">
        @for (line of lines(); track $index) {
          <div class="row">
            @if (lineNumbers()) {
              <span class="ln" aria-hidden="true">{{ $index + 1 }}</span>
            }
            <odlq-code-line [tokens]="line" />
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      position: relative;
      display: block;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-md);
      background: var(--ui-code-bg);
      font: var(--ui-text-sm) / var(--ui-code-lh, 20px) var(--ui-font-mono);
      --ui-code-lh: 20px;
    }
    .scroll {
      overflow: auto;
      padding: 8px 0;
      border-radius: inherit;
    }
    .lines {
      width: max-content;
      min-width: 100%;
    }
    .row {
      display: flex;
      padding-right: 44px;
    }
    .ln {
      flex: none;
      width: 44px;
      padding-right: 14px;
      color: var(--ui-code-lineno);
      text-align: right;
      user-select: none;
    }
    .copy {
      position: absolute;
      top: 6px;
      right: 6px;
      z-index: 1;
    }
  `,
})
export class OdlqCodeBlock {
  readonly code = input.required<string>();
  readonly language = input<CodeLanguage>('json');
  readonly lineNumbers = input(true, { transform: booleanAttribute });
  readonly copyable = input(true, { transform: booleanAttribute });
  readonly maxHeight = input<string | null>(null);
  readonly label = input('Code');

  protected readonly copied = signal(false);
  protected readonly lines = computed(() => highlight(this.code(), this.language()));

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      /* clipboard indisponível (contexto inseguro): ignora */
    }
  }
}
