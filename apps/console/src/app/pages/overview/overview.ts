import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BreakersStore, FailuresStore } from '@opendlq/modules';
import {
  OdlqAlert, OdlqBreakerCard, OdlqCard, OdlqChartLegend, OdlqFunnel, OdlqKpiCard, OdlqKpiRow, OdlqLineChart, OdlqPageHeader, OdlqStateStrip,
  formatAge, type MessageState,
} from '@opendlq/ui';

@Component({
  selector: 'odlq-overview-page',
  imports: [OdlqPageHeader, OdlqAlert, OdlqKpiRow, OdlqKpiCard, OdlqStateStrip, OdlqCard, OdlqFunnel, OdlqLineChart, OdlqChartLegend, OdlqBreakerCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class OverviewPage {
  private readonly router = inject(Router);
  protected readonly store = inject(FailuresStore);
  protected readonly breakers = inject(BreakersStore);

  protected readonly maxAge = computed(() => formatAge(this.store.maxAgeMin()));
  protected readonly categories = Array.from({ length: 12 }, (_, i) => (i === 11 ? 'now' : `-${11 - i}h`));
  protected readonly arrivals = computed(() => [{ name: 'Arrivals', values: this.store.arrivalsPerHour(), color: 'var(--ui-chart-1)' }]);
  protected readonly openCircuits = computed(() => this.breakers.views().filter((v) => v.breaker.state === 'open'));

  /** Clicar num estado leva à lista de falhas já filtrada por ele. */
  protected goToState(state: MessageState | null): void {
    this.store.clearFilters();
    this.store.state.set(state);
    void this.router.navigateByUrl('/failures');
  }
}
