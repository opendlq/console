import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GroupViewStore } from '@opendlq/modules';
import {
  OdlqAlert, OdlqBulkActionBar, OdlqButton, OdlqCard, OdlqConfirmDialog, OdlqEmptyState, OdlqFilterBar, OdlqInlineStats, OdlqKpiCard,
  OdlqKpiRow, OdlqLogExtract, OdlqMessageDetailDrawer, OdlqMessageTable, OdlqPageHeader, OdlqPagination, OdlqReclassifyDialog, OdlqReplayDrawer,
  OdlqSparkline, OdlqToastService, formatAge, type DlqMessage, type FailureKind, type OdlqReplayRequest, type OdlqStat,
} from '@opendlq/ui';

/** Página de uma causa: o operador inspeciona mensagens, lê os logs correlacionados e decide (replay, editar, reclassificar, descartar). */
@Component({
  selector: 'odlq-failure-page',
  imports: [
    OdlqPageHeader, OdlqButton, OdlqInlineStats, OdlqKpiRow, OdlqKpiCard, OdlqSparkline, OdlqAlert, OdlqCard, OdlqLogExtract, OdlqFilterBar,
    OdlqBulkActionBar, OdlqMessageTable, OdlqPagination, OdlqMessageDetailDrawer, OdlqReplayDrawer, OdlqReclassifyDialog, OdlqConfirmDialog, OdlqEmptyState,
  ],
  providers: [GroupViewStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './failure.html',
  styleUrl: './failure.css',
})
export class FailurePage {
  /** Parâmetro de rota `:key` (via withComponentInputBinding). */
  readonly key = input.required<string>();

  protected readonly router = inject(Router);
  protected readonly store = inject(GroupViewStore);
  private readonly toast = inject(OdlqToastService);

  protected readonly stats = computed<OdlqStat[]>(() => {
    const g = this.store.group();
    return g
      ? [
          { label: 'Kind', value: g.kind, badge: g.kind === 'transient' ? 'info' : g.kind === 'permanent' ? 'danger' : 'neutral' },
          { label: 'Consumer', value: g.consumer },
          { label: 'Dependency', value: g.dependency ?? '—' },
          { label: 'Classified by', value: g.classifiedBy },
          { label: 'Group', value: g.key },
        ]
      : [];
  });
  protected readonly oldest = computed(() => formatAge(this.store.group()?.oldestMin ?? 0));
  protected readonly targets = computed(() => this.store.targets().map((t) => ({ value: t, label: t })));

  /** Mensagens que a próxima ação (drawer/diálogo) vai afetar: a seleção, a mensagem aberta ou o grupo todo. */
  protected readonly pending = signal<DlqMessage[]>([]);
  protected readonly inspectOpen = signal(false);
  protected readonly replayOpen = signal(false);
  protected readonly editOpen = signal(false);
  protected readonly reclassifyOpen = signal(false);
  protected readonly discardOpen = signal(false);

  constructor() {
    effect(() => this.store.key.set(this.key()));
  }

  protected inspect(m: DlqMessage): void {
    this.store.activeId.set(m.id);
    this.inspectOpen.set(true);
  }

  /** Abre a ação sobre `list` (e fecha o inspetor, se estiver aberto). */
  protected ask(list: DlqMessage[], open: { set(v: boolean): void }): void {
    this.pending.set(list);
    this.inspectOpen.set(false);
    open.set(true);
  }

  protected replay(req: OdlqReplayRequest): void {
    const n = this.store.replay(this.pending(), req);
    this.toast.show({ title: `${n} message(s) queued for replay`, message: `Sent to ${req.target}`, tone: 'success' });
  }

  protected editAndReplay(req: OdlqReplayRequest): void {
    const m = this.pending()[0];
    if (m && this.store.editAndReplay(m, req.payload ?? m.payload, req)) {
      this.toast.show({ title: 'Edited message queued for replay', message: `Same x-dlq-id, sent to ${req.target}`, tone: 'success' });
    }
  }

  protected reclassify(kind: FailureKind): void {
    const n = this.store.reclassify(this.pending(), kind);
    this.toast.show({ title: `${n} message(s) reclassified as ${kind}`, tone: 'info' });
  }

  protected discard(): void {
    const n = this.store.discard(this.pending());
    this.toast.show({ title: `${n} message(s) discarded`, message: 'Recorded in the audit log', tone: 'info' });
  }
}
