import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { OdlqBadge } from '../badge/badge';
import { OdlqButton } from '../button/button';
import type { Runbook, RunbookAction, RunbookStatus } from '../domain';
import { OdlqProgress } from '../progress/progress';
import type { OdlqTone } from '../types';

const STATUS: Record<RunbookStatus, { tone: OdlqTone; hint: string }> = {
  suggested: { tone: 'info', hint: 'The same action was applied to this group 3 times' },
  dry_run: { tone: 'info', hint: 'Running against the message history' },
  supervised: { tone: 'warning', hint: 'The first runs wait for approval' },
  automatic: { tone: 'success', hint: 'Runs on its own, within its rate limit' },
  expired: { tone: 'danger', hint: 'Stopped. Renew it or fix the root cause' },
};
const ACTION: Record<RunbookAction, string> = { transform_replay: 'transform + replay', replay: 'replay', route: 'route', discard: 'discard' };

/** Runbook: condição, ação, status do ciclo de vida e guardrails (taxa, aprovações, expiração). */
@Component({
  selector: 'odlq-runbook-card',
  imports: [OdlqBadge, OdlqButton, OdlqProgress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="head">
      <div>
        <h2>{{ runbook().name }}</h2>
        <span class="sub">{{ runbook().consumer }} · {{ action() }}</span>
      </div>
      <odlq-badge mono [tone]="status().tone" [attr.title]="status().hint">{{ runbook().status.replace('_', ' ') }}</odlq-badge>
    </div>
    <code>{{ runbook().match }}</code>
    <div class="guards">
      <div>
        <div class="lbl"><span>Rate this hour</span><strong>{{ runbook().usedThisHour }} / {{ runbook().maxPerHour }}</strong></div>
        <odlq-progress [value]="runbook().usedThisHour" [max]="runbook().maxPerHour" label="Runs this hour" />
      </div>
      <div>
        <div class="lbl"><span>Approvals</span><strong>{{ runbook().approvalsDone }} / {{ runbook().approvalsRequired }}</strong></div>
        <odlq-progress [value]="runbook().approvalsDone" [max]="runbook().approvalsRequired || 1" tone="success" label="Approved runs" />
      </div>
    </div>
    <div class="foot">
      <span class="exp" [attr.data-soon]="runbook().daysLeft < 30">
        {{ runbook().daysLeft < 0 ? 'Expired ' + runbook().expires : 'Expires ' + runbook().expires + ' · ' + runbook().daysLeft + ' days' }}
      </span>
      @if (pending() > 0) {
        <span class="actions">
          <button odlq-button size="sm" variant="outline" (click)="reject.emit()">Reject</button>
          <button odlq-button size="sm" variant="primary" (click)="approve.emit()">Approve {{ pending() }} waiting</button>
        </span>
      }
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 16px;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-lg);
      background: var(--ui-surface);
    }
    .head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
    }
    h2 {
      margin: 0;
      font: 600 var(--ui-text-lg) var(--ui-font-mono);
    }
    .sub {
      color: var(--ui-text-subtle);
      font-size: var(--ui-text-sm);
    }
    code {
      padding: 8px 10px;
      border-radius: var(--ui-radius-md);
      background: var(--ui-code-bg);
      color: var(--ui-code-text);
      font: var(--ui-text-sm) / 1.5 var(--ui-font-mono);
      overflow-wrap: anywhere;
    }
    .guards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .lbl {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      color: var(--ui-text-muted);
      font-size: var(--ui-text-sm);
    }
    .lbl strong {
      color: var(--ui-text);
      font-variant-numeric: tabular-nums;
    }
    .foot {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .exp {
      color: var(--ui-text-muted);
      font: var(--ui-text-sm) var(--ui-font-mono);
    }
    .exp[data-soon='true'] {
      color: var(--ui-warning);
    }
    .actions {
      display: flex;
      gap: 8px;
    }
  `,
})
export class OdlqRunbookCard {
  readonly runbook = input.required<Runbook>();
  /** Mensagens em `awaiting_approval` neste runbook. */
  readonly pending = input(0);
  readonly approve = output<void>();
  readonly reject = output<void>();
  protected readonly status = computed(() => STATUS[this.runbook().status]);
  protected readonly action = computed(() => ACTION[this.runbook().action]);
}
