import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { OdlqIcon } from '../icon/icon';

export interface OdlqCrumb {
  label: string;
  href?: string;
}

/** Cabeçalho de página: breadcrumb + título, slots `[actions]` (direita) e `[meta]` (barra de métricas). */
@Component({
  selector: 'odlq-page-header',
  imports: [OdlqIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row">
      <h1>
        @for (c of crumbs(); track c.label) {
          <a class="crumb" [attr.href]="c.href ?? null" (click)="crumbSelect.emit(c)">{{ c.label }}</a>
          <odlq-icon name="chevron-right" [size]="16" class="sep" />
        }
        <span class="title">{{ title() }}</span>
      </h1>
      <div class="actions"><ng-content select="[actions]" /></div>
    </div>
    <ng-content select="[meta]" />
    <ng-content />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    h1 {
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 0;
      min-width: 0;
      font-size: var(--ui-text-xl);
      font-weight: 600;
    }
    .crumb {
      color: var(--ui-text-subtle);
      cursor: pointer;
      text-decoration: none;
    }
    .crumb:hover {
      color: var(--ui-text);
    }
    .sep {
      color: var(--ui-text-subtle);
    }
    .title {
      overflow: hidden;
      font-size: 18px;
      font-weight: 700;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .actions {
      display: flex;
      gap: 8px;
      margin-left: auto;
    }
  `,
})
export class OdlqPageHeader {
  readonly title = input.required<string>();
  readonly crumbs = input<OdlqCrumb[]>([]);
  readonly crumbSelect = output<OdlqCrumb>();
}
