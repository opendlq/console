import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Lista de headers de uma mensagem (chave/valor em monoespaçada). */
@Component({
  selector: 'odlq-header-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (h of entries(); track h[0]) {
      <div class="row">
        <dt>{{ h[0] }}</dt>
        <dd>{{ h[1] }}</dd>
      </div>
    } @empty {
      <p class="none">This message has no headers.</p>
    }
  `,
  styles: `
    :host {
      display: block;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-md);
      background: var(--ui-code-bg);
    }
    .row {
      display: grid;
      grid-template-columns: minmax(120px, 38%) 1fr;
      gap: 12px;
      padding: 8px 12px;
      border-bottom: 1px solid var(--ui-border);
      font: var(--ui-text-sm) / 1.5 var(--ui-font-mono);
    }
    .row:last-child {
      border-bottom: 0;
    }
    dt {
      color: var(--ui-code-key);
      overflow-wrap: anywhere;
    }
    dd {
      margin: 0;
      color: var(--ui-code-string);
      overflow-wrap: anywhere;
    }
    .none {
      margin: 0;
      padding: 12px;
      color: var(--ui-text-muted);
      font-size: var(--ui-text-sm);
    }
  `,
})
export class OdlqHeaderList {
  readonly headers = input.required<Record<string, string>>();
  protected readonly entries = computed(() => Object.entries(this.headers()));
}
