import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RunbooksStore } from '@opendlq/modules';
import { OdlqAlert, OdlqKpiCard, OdlqKpiRow, OdlqPageHeader, OdlqRunbookCard, OdlqToastService } from '@opendlq/ui';

@Component({
  selector: 'odlq-runbooks-page',
  imports: [OdlqPageHeader, OdlqAlert, OdlqKpiRow, OdlqKpiCard, OdlqRunbookCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './runbooks.html',
  styleUrl: './runbooks.css',
})
export class RunbooksPage {
  protected readonly store = inject(RunbooksStore);
  private readonly toast = inject(OdlqToastService);

  protected approve(name: string): void {
    const n = this.store.approve(name);
    this.toast.show({ title: `${n} message(s) approved`, message: `Runbook ${name} runs on them`, tone: 'success' });
  }

  protected reject(name: string): void {
    const n = this.store.reject(name);
    this.toast.show({ title: `${n} message(s) rejected`, message: 'Back to waiting for an operator', tone: 'info' });
  }
}
