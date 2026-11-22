import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuditStore } from '@opendlq/modules';
import { OdlqAlert, OdlqAuditLog, OdlqPageHeader, OdlqSegmentedControl, type ActorKind, type OdlqOption } from '@opendlq/ui';

const ACTORS: OdlqOption[] = ['all', 'person', 'agent', 'runbook', 'controller'].map((a) => ({ value: a, label: a }));

@Component({
  selector: 'odlq-audit-page',
  imports: [OdlqPageHeader, OdlqAlert, OdlqAuditLog, OdlqSegmentedControl],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './audit.html',
  styleUrl: './audit.css',
})
export class AuditPage {
  protected readonly store = inject(AuditStore);
  protected readonly actors = ACTORS;
  /** Valor do segmento: 'all' ou o tipo de ator do filtro da store. */
  protected readonly selected = computed(() => this.store.actor() ?? 'all');

  protected select(v: string | null): void {
    this.store.actor.set(v && v !== 'all' ? (v as ActorKind) : null);
  }
}
