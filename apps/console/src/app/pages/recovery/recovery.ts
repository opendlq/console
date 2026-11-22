import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BreakersStore } from '@opendlq/modules';
import { OdlqAlert, OdlqBreakerCard, OdlqCard, OdlqKeyValueTable, OdlqPageHeader } from '@opendlq/ui';

@Component({
  selector: 'odlq-recovery-page',
  imports: [OdlqPageHeader, OdlqAlert, OdlqBreakerCard, OdlqCard, OdlqKeyValueTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recovery.html',
  styleUrl: './recovery.css',
})
export class RecoveryPage {
  protected readonly store = inject(BreakersStore);
}
