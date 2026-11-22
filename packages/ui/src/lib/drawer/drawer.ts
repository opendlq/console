import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, booleanAttribute, input, model, output } from '@angular/core';
import { OdlqIconButton } from '../button/icon-button';
import { nextId } from '../types';

/**
 * Painel lateral direito (Reprocess message, Add JS filter, detalhe da mensagem).
 * Slots: conteúdo, `[header]` (ao lado do título, ex.: abas) e `[footer]` (ações).
 * `placement="container"` posiciona dentro do ancestral `position: relative` em vez da viewport.
 */
@Component({
  selector: 'odlq-drawer',
  imports: [CdkTrapFocus, OdlqIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'open() && close()' },
  template: `
    @if (open()) {
      @if (modal()) {
        <div class="scrim" [attr.data-placement]="placement()" (click)="close()"></div>
      }
      <div
        class="panel"
        role="dialog"
        [attr.aria-modal]="modal()"
        [attr.aria-labelledby]="heading() ? titleId : null"
        [attr.aria-label]="heading() ? null : label()"
        [attr.data-placement]="placement()"
        [style.width]="width()"
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="true"
      >
        <header>
          @if (back()) {
            <button odlq-icon-button icon="arrow-left" label="Back" size="sm" (click)="backClick.emit()"></button>
          }
          @if (heading()) {
            <h2 [id]="titleId">{{ heading() }}</h2>
          }
          <div class="slot"><ng-content select="[header]" /></div>
          <button odlq-icon-button icon="close" label="Close" variant="secondary" round size="sm" (click)="close()"></button>
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
    .panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      z-index: calc(var(--ui-z-drawer) + 1);
      display: flex;
      flex-direction: column;
      max-width: 100vw;
      border-left: 1px solid var(--ui-border);
      background: var(--ui-surface);
      box-shadow: var(--ui-shadow-lg);
      animation: slide-in 180ms cubic-bezier(0.2, 0, 0, 1);
    }
    .panel[data-placement='container'],
    .scrim[data-placement='container'] {
      position: absolute;
    }
    header {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 56px;
      padding: 0 16px;
      border-bottom: 1px solid var(--ui-border);
    }
    h2 {
      margin: 0;
      font-size: var(--ui-text-lg);
      font-weight: 600;
    }
    .slot {
      display: flex;
      flex: 1;
      align-items: center;
      min-width: 0;
    }
    .body {
      flex: 1;
      min-height: 0;
      overflow: auto;
      padding: 16px;
    }
    footer {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid var(--ui-border);
    }
    footer:empty {
      display: none;
    }
    footer ::ng-deep > * {
      flex: 1;
    }
    @keyframes slide-in {
      from {
        transform: translateX(24px);
        opacity: 0;
      }
    }
  `,
})
export class OdlqDrawer {
  readonly open = model(false);
  readonly heading = input('');
  /** `aria-label` quando não há `heading` visível. */
  readonly label = input('Panel');
  readonly width = input('480px');
  readonly back = input(false, { transform: booleanAttribute });
  /** Escurece o fundo e fecha ao clicar fora. */
  readonly modal = input(false, { transform: booleanAttribute });
  readonly placement = input<'viewport' | 'container'>('viewport');
  readonly backClick = output<void>();
  readonly closed = output<void>();
  protected readonly titleId = nextId('odlq-drawer');

  protected close(): void {
    this.open.set(false);
    this.closed.emit();
  }
}
