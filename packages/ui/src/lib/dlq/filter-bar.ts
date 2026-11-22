import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { OdlqButton } from '../button/button';
import { OdlqIconButton } from '../button/icon-button';
import { OdlqIcon } from '../icon/icon';
import { OdlqInput } from '../input/input';

/** Barra de filtros: busca rápida + filtros projetados (`<odlq-select>`, segmentos…) + limpar + atualizar. */
@Component({
  selector: 'odlq-filter-bar',
  imports: [OdlqInput, OdlqButton, OdlqIconButton, OdlqIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <odlq-input class="search" icon="search" [(value)]="query" [placeholder]="placeholder()" label="Quick search" />
    <ng-content />
    @if (active()) {
      <button odlq-button variant="ghost" (click)="clear.emit()"><odlq-icon name="close" [size]="14" /> Clear filters</button>
    }
    <button odlq-icon-button class="refresh" icon="refresh" label="Refresh" variant="outline" (click)="refresh.emit()"></button>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    .search {
      width: 260px;
    }
    .refresh {
      margin-left: auto;
    }
  `,
})
export class OdlqFilterBar {
  readonly query = model('');
  readonly placeholder = input('Search by cause, reason or key…');
  /** Há algum filtro aplicado (mostra "Clear filters"). */
  readonly active = input(false);
  readonly refresh = output<void>();
  readonly clear = output<void>();
}
