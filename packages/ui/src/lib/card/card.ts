import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

/** Superfície com cabeçalho opcional (`heading`) e slot `[actions]`. */
@Component({
  selector: 'odlq-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-flush]': 'flush() || null', '[attr.data-muted]': 'muted() || null' },
  template: `
    @if (heading()) {
      <div class="head">
        <h2>{{ heading() }}</h2>
        <div class="actions"><ng-content select="[actions]" /></div>
      </div>
    }
    <div class="body"><ng-content /></div>
  `,
  styles: `
    :host {
      display: block;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-lg);
      background: var(--ui-surface);
    }
    :host([data-muted]) {
      background: var(--ui-surface-muted);
    }
    .head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px 0;
    }
    h2 {
      margin: 0;
      font-size: var(--ui-text-md);
      font-weight: 600;
    }
    .actions {
      display: flex;
      gap: 8px;
      margin-left: auto;
    }
    .body {
      padding: 16px;
    }
    :host([data-flush]) .body {
      padding: 0;
    }
  `,
})
export class OdlqCard {
  readonly heading = input('');
  /** Remove o padding do corpo (útil para tabelas/gráficos de borda a borda). */
  readonly flush = input(false, { transform: booleanAttribute });
  readonly muted = input(false, { transform: booleanAttribute });
}
