import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { OdlqCheckbox } from '../checkbox/checkbox';
import { OdlqIcon } from '../icon/icon';

export interface OdlqColumn<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'start' | 'center' | 'end';
  /** Fonte monoespaçada (IDs, offsets, chaves). */
  mono?: boolean;
  /** Valor da célula quando não é `row[key]`; também usado na ordenação. */
  accessor?: (row: T) => unknown;
}

export interface OdlqSort {
  key: string;
  dir: 'asc' | 'desc';
}

/** Template de célula customizada: `<ng-template odlqCell="status" let-row>…</ng-template>`. */
@Directive({ selector: 'ng-template[odlqCell]' })
export class OdlqCellDef {
  readonly column = input.required<string>({ alias: 'odlqCell' });
  readonly template = inject(TemplateRef);
}

/**
 * Tabela de dados: ordenação local, seleção por checkbox, linha clicável/ativa e células
 * customizáveis por coluna. Slot `[empty]` para o estado vazio.
 */
@Component({
  selector: 'odlq-data-table',
  imports: [NgTemplateOutlet, OdlqCheckbox, OdlqIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-density]': 'density()' },
  template: `
    <div class="scroll" [style.max-height]="maxHeight()">
      <table [attr.aria-label]="caption() || null">
        <thead>
          <tr>
            @if (selectable()) {
              <th class="sel">
                <odlq-checkbox
                  label="Select all rows"
                  [value]="allSelected()"
                  [indeterminate]="someSelected()"
                  (valueChange)="toggleAll($event)"
                />
              </th>
            }
            @for (c of columns(); track c.key) {
              <th [style.width]="c.width" [style.text-align]="c.align" [attr.aria-sort]="ariaSort(c)">
                @if (c.sortable) {
                  <button type="button" (click)="toggleSort(c)">
                    {{ c.header }}
                    <odlq-icon [name]="sortIcon(c)" [size]="12" />
                  </button>
                } @else {
                  {{ c.header }}
                }
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of sorted(); track rowKey()(row, $index); let i = $index) {
            <tr
              [class.active]="row === activeRow()"
              [class.selected]="isSelected(row)"
              [class.clickable]="clickable()"
              [attr.tabindex]="clickable() ? 0 : null"
              [attr.aria-selected]="selectable() ? isSelected(row) : null"
              (click)="clickable() && rowClick.emit(row)"
              (keydown.enter)="clickable() && rowClick.emit(row)"
            >
              @if (selectable()) {
                <td class="sel" (click)="$event.stopPropagation()">
                  <odlq-checkbox label="Select row" [value]="isSelected(row)" (valueChange)="toggle(row, $event)" />
                </td>
              }
              @for (c of columns(); track c.key) {
                <td [class.mono]="c.mono" [style.text-align]="c.align">
                  @if (templates().get(c.key); as tpl) {
                    <ng-container *ngTemplateOutlet="tpl; context: { $implicit: row, row: row, value: cell(row, c), index: i }" />
                  } @else {
                    {{ cell(row, c) }}
                  }
                </td>
              }
            </tr>
          } @empty {
            <tr class="empty">
              <td [attr.colspan]="columns().length + (selectable() ? 1 : 0)"><ng-content select="[empty]" /></td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: `
    :host {
      display: block;
      overflow: hidden;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-lg);
      background: var(--ui-surface);
    }
    .scroll {
      overflow: auto;
    }
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: var(--ui-text-md);
    }
    th {
      position: sticky;
      top: 0;
      z-index: 1;
      padding: 0 14px;
      height: 36px;
      border-bottom: 1px solid var(--ui-border);
      background: var(--ui-surface-muted);
      color: var(--ui-text-muted);
      font-size: var(--ui-text-sm);
      font-weight: 500;
      text-align: left;
      white-space: nowrap;
    }
    th button {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 0;
      border: 0;
      background: none;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
    th button:hover {
      color: var(--ui-text);
    }
    td {
      height: 40px;
      padding: 0 14px;
      border-bottom: 1px solid var(--ui-border);
      white-space: nowrap;
    }
    :host([data-density='compact']) td {
      height: 32px;
    }
    td.mono {
      font-family: var(--ui-font-mono);
      font-size: var(--ui-text-sm);
    }
    .sel {
      width: 40px;
      padding-right: 0;
    }
    tbody tr:last-child td {
      border-bottom: 0;
    }
    tr.clickable {
      cursor: pointer;
    }
    tr.clickable:hover td,
    tr.selected td {
      background: var(--ui-surface-muted);
    }
    tr.active td {
      background: var(--ui-primary-soft);
    }
    tr.clickable:focus-visible {
      outline: 2px solid var(--ui-primary);
      outline-offset: -2px;
    }
    tr.empty td {
      height: auto;
      padding: 0;
    }
  `,
})
export class OdlqDataTable<T = any> {
  readonly columns = input.required<OdlqColumn<T>[]>();
  readonly rows = input.required<T[]>();
  /** Chave estável por linha (padrão: índice). */
  readonly rowKey = input<(row: T, index: number) => unknown>((_, i) => i);
  readonly selectable = input(false, { transform: booleanAttribute });
  readonly selection = model<T[]>([]);
  readonly sort = model<OdlqSort | null>(null);
  /** Linha destacada (ex.: a que está aberta no drawer). */
  readonly activeRow = input<T | null>(null);
  readonly clickable = input(false, { transform: booleanAttribute });
  readonly density = input<'comfortable' | 'compact'>('comfortable');
  readonly maxHeight = input<string | null>(null);
  /** Nome acessível da tabela. */
  readonly caption = input('');
  readonly rowClick = output<T>();

  private readonly defs = contentChildren(OdlqCellDef);
  protected readonly templates = computed(() => new Map(this.defs().map((d) => [d.column(), d.template])));

  protected readonly sorted = computed(() => {
    const s = this.sort();
    const col = s && this.columns().find((c) => c.key === s.key);
    if (!s || !col) return this.rows();
    const dir = s.dir === 'asc' ? 1 : -1;
    return [...this.rows()].sort((a, b) => {
      const x = this.cell(a, col) as never;
      const y = this.cell(b, col) as never;
      return (x < y ? -1 : x > y ? 1 : 0) * dir;
    });
  });

  protected readonly allSelected = computed(() => this.rows().length > 0 && this.selection().length === this.rows().length);
  protected readonly someSelected = computed(() => this.selection().length > 0 && !this.allSelected());

  protected cell(row: T, col: OdlqColumn<T>): unknown {
    return col.accessor ? col.accessor(row) : (row as Record<string, unknown>)[col.key];
  }

  protected isSelected(row: T): boolean {
    return this.selection().includes(row);
  }

  protected toggle(row: T, on: boolean): void {
    this.selection.update((s) => (on ? [...s, row] : s.filter((r) => r !== row)));
  }

  protected toggleAll(on: boolean): void {
    this.selection.set(on ? [...this.rows()] : []);
  }

  protected toggleSort(col: OdlqColumn<T>): void {
    const s = this.sort();
    this.sort.set(s?.key !== col.key ? { key: col.key, dir: 'asc' } : s.dir === 'asc' ? { key: col.key, dir: 'desc' } : null);
  }

  protected sortIcon(col: OdlqColumn<T>) {
    const s = this.sort();
    return s?.key === col.key ? (s.dir === 'asc' ? 'arrow-up' : 'arrow-down') : 'sort';
  }

  protected ariaSort(col: OdlqColumn<T>): 'ascending' | 'descending' | 'none' | null {
    if (!col.sortable) return null;
    const s = this.sort();
    return s?.key === col.key ? (s.dir === 'asc' ? 'ascending' : 'descending') : 'none';
  }
}
