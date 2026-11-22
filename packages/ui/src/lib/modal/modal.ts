import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, model, output, signal } from '@angular/core';
import { OdlqButton } from '../button/button';
import { OdlqIconButton } from '../button/icon-button';
import { OdlqInput } from '../input/input';
import { nextId } from '../types';

/** Diálogo modal centralizado. Slots: conteúdo e `[footer]`. Fecha com Esc ou clique no fundo. */
@Component({
  selector: 'odlq-modal',
  imports: [CdkTrapFocus, OdlqIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'open() && close()' },
  template: `
    @if (open()) {
      <div class="scrim" (click)="close()"></div>
      <div
        class="dialog"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
        [style.width]="width()"
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="true"
      >
        <header>
          <h2 [id]="titleId">{{ heading() }}</h2>
          <button odlq-icon-button icon="close" label="Close" size="sm" (click)="close()"></button>
        </header>
        <div class="body"><ng-content /></div>
        <footer><ng-content select="[footer]" /></footer>
      </div>
    }
  `,
  styles: `
    .scrim {
      position: fixed;
      inset: 0;
      z-index: var(--ui-z-drawer);
      background: var(--ui-overlay);
    }
    .dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      z-index: calc(var(--ui-z-drawer) + 1);
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 48px);
      display: flex;
      flex-direction: column;
      transform: translate(-50%, -50%);
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-xl);
      background: var(--ui-surface);
      box-shadow: var(--ui-shadow-lg);
      animation: pop 140ms cubic-bezier(0.2, 0, 0, 1);
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 16px 0 20px;
    }
    h2 {
      margin: 0;
      font-size: var(--ui-text-xl);
      font-weight: 600;
    }
    .body {
      overflow: auto;
      padding: 12px 20px 20px;
      color: var(--ui-text-muted);
      font-size: var(--ui-text-md);
    }
    footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 12px 20px 16px;
      border-top: 1px solid var(--ui-border);
    }
    footer:empty {
      display: none;
    }
    @keyframes pop {
      from {
        opacity: 0;
        transform: translate(-50%, calc(-50% + 8px));
      }
    }
  `,
})
export class OdlqModal {
  readonly open = model(false);
  readonly heading = input.required<string>();
  readonly width = input('440px');
  readonly closed = output<void>();
  protected readonly titleId = nextId('odlq-modal');

  protected close(): void {
    this.open.set(false);
    this.closed.emit();
  }
}

/** Confirmação de ação destrutiva. Com `requireText`, o usuário precisa digitar o texto exato (ex.: nome do tópico). */
@Component({
  selector: 'odlq-confirm-dialog',
  imports: [OdlqModal, OdlqButton, OdlqInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <odlq-modal [(open)]="open" [heading]="heading()" (closed)="cancelled.emit()">
      <p class="msg"><ng-content>{{ message() }}</ng-content></p>
      @if (requireText()) {
        <label class="confirm">
          <span>Type <code>{{ requireText() }}</code> to confirm</span>
          <odlq-input [(value)]="typed" [label]="'Confirmation text'" [placeholder]="requireText()" />
        </label>
      }
      <ng-container footer>
        <button odlq-button variant="outline" (click)="cancel()">{{ cancelLabel() }}</button>
        <button odlq-button [variant]="tone() === 'danger' ? 'danger' : 'primary'" [disabled]="!canConfirm()" (click)="confirm()">
          {{ confirmLabel() }}
        </button>
      </ng-container>
    </odlq-modal>
  `,
  styles: `
    .msg {
      margin: 0 0 12px;
    }
    .confirm {
      display: grid;
      gap: 6px;
      color: var(--ui-text);
    }
    code {
      font-family: var(--ui-font-mono);
      font-weight: 600;
    }
  `,
})
export class OdlqConfirmDialog {
  readonly open = model(false);
  readonly heading = input('Are you sure?');
  readonly message = input('');
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Cancel');
  readonly tone = input<'danger' | 'primary'>('danger');
  readonly requireText = input('');
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected readonly typed = signal('');
  protected readonly canConfirm = computed(() => !this.requireText() || this.typed() === this.requireText());

  protected confirm(): void {
    if (!this.canConfirm()) return;
    this.confirmed.emit();
    this.typed.set('');
    this.open.set(false);
  }

  protected cancel(): void {
    this.typed.set('');
    this.open.set(false);
    this.cancelled.emit();
  }
}
