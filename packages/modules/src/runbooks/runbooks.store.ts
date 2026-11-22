import { Injectable, computed, inject, signal } from '@angular/core';
import type { MessageState, Runbook, RunbookAction, RunbookStatus } from '@opendlq/ui';
import { FailuresStore } from '../failures/failures.store';
import runbooks from './__fixtures__/runbooks.json';

const AFTER_APPROVAL: Record<RunbookAction, MessageState> = { transform_replay: 'replaying', replay: 'replaying', route: 'routed', discard: 'discarded' };

/** Runbooks e a fila de aprovações dos que ainda estão supervisionados. */
@Injectable({ providedIn: 'root' })
export class RunbooksStore {
  private readonly failures = inject(FailuresStore);
  // ponytail: fixture; troque por inject(RunbooksService) do @opendlq/core quando existir.
  readonly runbooks = signal(runbooks as Runbook[]);
  /** Quantos runbooks há em cada status do ciclo de vida. */
  readonly byStatus = computed(() => {
    const counts: Record<RunbookStatus, number> = { suggested: 0, dry_run: 0, supervised: 0, automatic: 0, expired: 0 };
    for (const r of this.runbooks()) counts[r.status] += 1;
    return counts;
  });
  readonly expiringSoon = computed(() => this.runbooks().filter((r) => r.status !== 'expired' && r.daysLeft < 30));

  /** Mensagens esperando aprovação neste runbook. */
  pending(name: string): number {
    return this.awaiting(name).length;
  }

  /** Aprova a execução: as mensagens seguem a ação do runbook. Depois da última aprovação exigida, ele passa a `automatic`. */
  approve(name: string): number {
    const rb = this.runbooks().find((r) => r.name === name);
    if (!rb) return 0;
    const n = this.failures.move(this.awaiting(name), AFTER_APPROVAL[rb.action], { action: 'approve', note: `runbook ${name}` });
    if (n) {
      this.patch(name, (r) => {
        const approvalsDone = Math.min(r.approvalsDone + 1, r.approvalsRequired);
        return { approvalsDone, status: r.status === 'supervised' && approvalsDone >= r.approvalsRequired ? 'automatic' : r.status };
      });
    }
    return n;
  }

  /** Rejeita: as mensagens voltam a esperar um operador. */
  reject(name: string): number {
    return this.failures.move(this.awaiting(name), 'awaiting_operator', { action: 'reject', note: `runbook ${name}` });
  }

  private awaiting(name: string): string[] {
    return this.failures.messages().filter((m) => m.runbook === name && m.state === 'awaiting_approval').map((m) => m.id);
  }

  private patch(name: string, fn: (r: Runbook) => Partial<Runbook>): void {
    this.runbooks.update((l) => l.map((r) => (r.name === name ? { ...r, ...fn(r) } : r)));
  }
}
