import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TopicMessagesStore, TopicsStore } from '@opendlq/modules';
import {
  OdlqBulkActionBar, OdlqButton, OdlqConfirmDialog, OdlqFilterBar, OdlqJsFilterDrawer, OdlqKpiCard, OdlqKpiRow, OdlqMessageDetailDrawer,
  OdlqMessageTable, OdlqPageHeader, OdlqPagination, OdlqReprocessDrawer, OdlqToastService, type OdlqReprocessRequest,
} from '@opendlq/ui';

/** Página: só liga a UI às stores de `@opendlq/modules` e dispara efeitos de tela (toast, download, rota). */
@Component({
  selector: 'odlq-topic-page',
  imports: [
    OdlqPageHeader, OdlqKpiRow, OdlqKpiCard, OdlqFilterBar, OdlqBulkActionBar, OdlqMessageTable, OdlqPagination, OdlqButton,
    OdlqMessageDetailDrawer, OdlqReprocessDrawer, OdlqJsFilterDrawer, OdlqConfirmDialog,
  ],
  providers: [TopicMessagesStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topic.html',
  styleUrl: './topic.css',
})
export class TopicPage {
  /** Parâmetro de rota `:name` (via withComponentInputBinding). */
  readonly name = input.required<string>();

  protected readonly router = inject(Router);
  protected readonly store = inject(TopicMessagesStore);
  private readonly topics = inject(TopicsStore);
  private readonly toast = inject(OdlqToastService);

  protected readonly topic = computed(() => this.topics.find(this.name()));
  protected readonly targets = computed(() =>
    this.store.destinations(this.topic()?.sourceTopic).map((t) => ({ value: t, label: t })),
  );

  protected readonly detailOpen = signal(false);
  protected readonly reprocessOpen = signal(false);
  protected readonly jsOpen = signal(false);
  protected readonly discardOpen = signal(false);

  protected reprocessOne(req: OdlqReprocessRequest): void {
    const m = this.store.active();
    if (m) this.store.reprocess([m]);
    this.toast.show({ title: 'Message queued for reprocessing', message: `Sent to ${req.topic}`, tone: 'success' });
  }

  protected reprocessSelected(): void {
    const n = this.store.reprocessSelected();
    this.toast.show({ title: `${n} message(s) queued for reprocessing`, tone: 'success' });
  }

  protected discard(): void {
    const n = this.store.discardSelected();
    this.toast.show({ title: `${n} message(s) discarded`, tone: 'info' });
  }

  protected exportSelected(): void {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(this.store.selection(), null, 2)], { type: 'application/json' }));
    a.download = `${this.name()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}
