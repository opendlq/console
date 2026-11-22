import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { OdlqIcon } from '../icon/icon';
import { OdlqTooltip } from '../tooltip/tooltip';

export interface OdlqKeyValue {
  key: string;
  value: string | number | boolean;
  /** Descrição exibida no tooltip do ⓘ. */
  info?: string;
  /** Valor sobrescrito em relação ao padrão (usado pelo filtro "show overrides only"). */
  overridden?: boolean;
}

/** Tabela de propriedades (ex.: configuração de tópico): chave mono + ⓘ à esquerda, valor à direita. */
@Component({
  selector: 'odlq-key-value-table',
  imports: [OdlqIcon, OdlqTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <table [attr.aria-label]="caption() || null">
      <thead>
        <tr>
          <th scope="col">{{ keyHeader() }}</th>
          <th scope="col">{{ valueHeader() }}</th>
        </tr>
      </thead>
      <tbody>
        @for (r of rows(); track r.key) {
          <tr>
            <td class="k">
              <odlq-icon name="info" [size]="13" [odlqTooltip]="r.info ?? r.key" tabindex="0" label="Info" />
              <span>{{ r.key }}</span>
            </td>
            <td class="v">{{ r.value }}</td>
          </tr>
        } @empty {
          <tr>
            <td colspan="2" class="none">No properties match.</td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: `
    :host {
      display: block;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--ui-text-md);
    }
    th {
      height: 36px;
      padding: 0 14px;
      border-bottom: 1px solid var(--ui-border);
      color: var(--ui-text-muted);
      font-size: var(--ui-text-sm);
      font-weight: 500;
      text-align: left;
    }
    td {
      height: 40px;
      padding: 0 14px;
      border-bottom: 1px solid var(--ui-border);
    }
    tr:last-child td {
      border-bottom: 0;
    }
    .k {
      display: flex;
      align-items: center;
      gap: 10px;
      font: var(--ui-text-sm) var(--ui-font-mono);
    }
    .k odlq-icon {
      color: var(--ui-text-subtle);
      cursor: help;
    }
    .v {
      font-family: var(--ui-font-mono);
      font-size: var(--ui-text-sm);
    }
    .none {
      color: var(--ui-text-muted);
      text-align: center;
    }
  `,
})
export class OdlqKeyValueTable {
  readonly rows = input.required<OdlqKeyValue[]>();
  readonly keyHeader = input('Property');
  readonly valueHeader = input('Value');
  readonly caption = input('');
}
