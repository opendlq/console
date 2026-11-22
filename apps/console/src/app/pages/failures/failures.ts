import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FailuresStore, GroupListStore } from '@opendlq/modules';
import {
  OdlqBulkActionBar, OdlqConfirmDialog, OdlqFilterBar, OdlqGroupTable, OdlqPageHeader, OdlqReclassifyDialog, OdlqReplayDrawer, OdlqSelect,
  OdlqStateStrip, OdlqToastService, type FailureGroup, type FailureKind, type OdlqOption, type OdlqReplayRequest,
} from '@opendlq/ui';

const KINDS: OdlqOption<FailureKind>[] = ['transient', 'permanent', 'unknown'].map((k) => ({ value: k as FailureKind, label: k }));

/** Página: liga a UI às stores de `@opendlq/modules` e dispara efeitos de tela (toast, rota, drawers). */
@Component({
  selector: 'odlq-failures-page',
  imports: [
    OdlqPageHeader, OdlqStateStrip, OdlqFilterBar, OdlqSelect, OdlqBulkActionBar, OdlqGroupTable, OdlqReplayDrawer, OdlqReclassifyDialog, OdlqConfirmDialog,
  ],
  providers: [GroupListStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './failures.html',
  styleUrl: './failures.css',
})
export class FailuresPage {
  private readonly router = inject(Router);
  private readonly toast = inject(OdlqToastService);
  protected readonly store = inject(FailuresStore);
  protected readonly list = inject(GroupListStore);

  protected readonly kinds = KINDS;
  protected readonly consumers = computed(() => this.store.consumers().map((c) => ({ value: c, label: c })));
  protected readonly targets = computed(() => this.list.targets().map((t) => ({ value: t, label: t })));

  protected readonly replayOpen = signal(false);
  protected readonly reclassifyOpen = signal(false);
  protected readonly discardOpen = signal(false);

  protected open(g: FailureGroup): void {
    void this.router.navigate(['/failures', g.key]);
  }

  protected replay(req: OdlqReplayRequest): void {
    const n = this.list.replay(req);
    this.toast.show({ title: `${n} message(s) queued for replay`, message: `Sent to ${req.target} at ${req.rate} msg/s`, tone: 'success' });
  }

  protected reclassify(kind: FailureKind): void {
    const n = this.list.reclassify(kind);
    this.toast.show({ title: `${n} message(s) reclassified as ${kind}`, tone: 'info' });
  }

  protected discard(): void {
    const n = this.list.discard();
    this.toast.show({ title: `${n} message(s) discarded`, message: 'Recorded in the audit log', tone: 'info' });
  }
}
