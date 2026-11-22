import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { OdlqIconButton } from '../button/icon-button';

/** Paginação simples: "1–50 of 260" + anterior/próxima. `page` é base 1. */
@Component({
  selector: 'odlq-pagination',
  imports: [OdlqIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'navigation', 'aria-label': 'Pagination' },
  template: `
    <span class="range" aria-live="polite">{{ from() }}–{{ to() }} of {{ total() }}</span>
    <button odlq-icon-button size="sm" variant="outline" icon="chevron-left" label="Previous page" [disabled]="page() <= 1" (click)="page.set(page() - 1)"></button>
    <button odlq-icon-button size="sm" variant="outline" icon="chevron-right" label="Next page" [disabled]="page() >= pages()" (click)="page.set(page() + 1)"></button>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--ui-text-muted);
      font-size: var(--ui-text-sm);
    }
    .range {
      margin-right: 4px;
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class OdlqPagination {
  readonly page = model(1);
  readonly pageSize = input(50);
  readonly total = input.required<number>();
  protected readonly pages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  protected readonly from = computed(() => (this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1));
  protected readonly to = computed(() => Math.min(this.total(), this.page() * this.pageSize()));
}
