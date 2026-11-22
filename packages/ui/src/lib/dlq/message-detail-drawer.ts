import { ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';
import { OdlqButton } from '../button/button';
import { OdlqCodeBlock } from '../code/code-block';
import { isOpen, prettyPayload, type DlqMessage, type Transition } from '../domain';
import { OdlqDrawer } from '../drawer/drawer';
import { OdlqIcon } from '../icon/icon';
import { OdlqTabs, type OdlqTab } from '../tabs/tabs';
import { OdlqAttemptTimeline } from './attempt-timeline';
import { OdlqHeaderList } from './header-list';
import { OdlqKindBadge } from './kind-badge';
import { OdlqLogExtract } from './log-extract';
import { OdlqStateBadge } from './state-badge';

const TABS: OdlqTab[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'payload', label: 'Payload' },
  { value: 'headers', label: 'Headers' },
  { value: 'logs', label: 'Logs' },
  { value: 'history', label: 'History' },
];

/** Inspeção de uma mensagem: visão geral, payload, headers, logs correlacionados e histórico. Ações do operador no rodapé. */
@Component({
  selector: 'odlq-message-detail-drawer',
  imports: [OdlqDrawer, OdlqTabs, OdlqCodeBlock, OdlqButton, OdlqIcon, OdlqHeaderList, OdlqStateBadge, OdlqKindBadge, OdlqAttemptTimeline, OdlqLogExtract],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <odlq-drawer [(open)]="open" [width]="width()" [placement]="placement()" label="Message details">
      <odlq-tabs header variant="pill" [tabs]="tabs" [(selected)]="tab" label="Message sections" />
      @if (message(); as m) {
        @switch (tab()) {
          @case ('overview') {
            <dl>
              <dt>State</dt><dd><odlq-state-badge [state]="m.state" /></dd>
              <dt>Kind</dt><dd><odlq-kind-badge [kind]="m.kind" /> <span class="by">classified by {{ m.classifiedBy }}</span></dd>
              <dt>Reason</dt><dd>{{ m.reason }}</dd>
              <dt>Consumer</dt><dd class="mono">{{ m.consumer }}</dd>
              <dt>Dependency</dt><dd class="mono">{{ m.dependency || '—' }}</dd>
              <dt>Group</dt><dd class="mono">{{ m.groupKey }}</dd>
              <dt>Attempts</dt><dd class="mono">{{ failed() }}</dd>
              @if (m.nextRetryAt) {
                <dt>Next retry</dt><dd class="mono">{{ m.nextRetryAt }}</dd>
              }
              @if (m.runbook) {
                <dt>Runbook</dt><dd class="mono">{{ m.runbook }}</dd>
              }
              <dt>Received</dt><dd class="mono">{{ m.receivedAt }}</dd>
              <dt>Expires</dt><dd class="mono">{{ m.expiresAt }}</dd>
              <dt>Source</dt><dd class="mono">{{ m.sourceTopic }} · p{{ m.partition }} · {{ m.offset }}</dd>
              <dt>Replays to</dt><dd class="mono">{{ m.originalTopic }} · key {{ m.partitionKey }}</dd>
              <dt>x-dlq-id</dt><dd class="mono">{{ m.id }}</dd>
            </dl>
          }
          @case ('payload') {
            <odlq-code-block [code]="pretty(m.payload)" language="json" label="Message payload" />
          }
          @case ('headers') {
            <odlq-header-list [headers]="m.headers" />
          }
          @case ('logs') {
            <odlq-log-extract [enrichment]="m.enrichment" />
          }
          @case ('history') {
            <h4>State changes</h4>
            <ol class="changes">
              @for (t of history(); track t.id) {
                <li>
                  <span class="at">{{ t.at }}</span>
                  <span>{{ t.by }} · {{ t.action }}@if (t.to) { → <odlq-state-badge [state]="t.to" /> }</span>
                  @if (t.note) {
                    <small>{{ t.note }}</small>
                  }
                </li>
              }
            </ol>
            <h4>Attempts</h4>
            @if (m.attempts.length) {
              <odlq-attempt-timeline [attempts]="m.attempts" />
            } @else {
              <p class="none">No retries. Permanent failures wait for an operator.</p>
            }
          }
        }
      }
      <ng-container footer>
        <button odlq-button variant="primary" [disabled]="!actionable()" (click)="act(replay)"><odlq-icon name="reprocess" [size]="14" /> Replay</button>
        <button odlq-button variant="outline" [disabled]="!actionable()" (click)="act(editReplay)"><odlq-icon name="edit" [size]="14" /> Edit and replay</button>
        <button odlq-button variant="outline" [disabled]="!actionable()" (click)="act(reclassify)"><odlq-icon name="tag" [size]="14" /> Reclassify</button>
        <button odlq-button variant="danger-soft" [disabled]="!actionable()" (click)="act(discard)"><odlq-icon name="discard" [size]="14" /> Discard</button>
      </ng-container>
    </odlq-drawer>
  `,
  styles: `
    dl {
      display: grid;
      grid-template-columns: 110px 1fr;
      gap: 10px 12px;
      margin: 0;
      font-size: var(--ui-text-md);
    }
    dt {
      color: var(--ui-text-muted);
    }
    dd {
      margin: 0;
      overflow-wrap: anywhere;
    }
    .mono {
      font: var(--ui-text-sm) var(--ui-font-mono);
    }
    .by {
      margin-left: 6px;
      color: var(--ui-text-subtle);
      font-size: var(--ui-text-sm);
    }
    h4 {
      margin: 0 0 12px;
      font-size: var(--ui-text-md);
    }
    h4:not(:first-child) {
      margin-top: 24px;
    }
    .changes {
      display: grid;
      gap: 12px;
      margin: 0;
      padding: 0;
      list-style: none;
      font-size: var(--ui-text-md);
    }
    .changes li {
      display: grid;
      gap: 2px;
    }
    .at {
      color: var(--ui-text-subtle);
      font: var(--ui-text-xs) var(--ui-font-mono);
    }
    small,
    .none {
      color: var(--ui-text-muted);
      font-size: var(--ui-text-sm);
    }
    .none {
      margin: 0;
    }
  `,
})
export class OdlqMessageDetailDrawer {
  readonly open = model(false);
  readonly message = input<DlqMessage | null>(null);
  /** Mudanças de estado da mensagem (auditoria). */
  readonly history = input<Transition[]>([]);
  readonly width = input('560px');
  readonly placement = input<'viewport' | 'container'>('viewport');
  readonly replay = output<DlqMessage>();
  readonly editReplay = output<DlqMessage>();
  readonly reclassify = output<DlqMessage>();
  readonly discard = output<DlqMessage>();

  protected readonly pretty = prettyPayload;
  protected readonly tabs = TABS;
  protected readonly tab = signal('overview');
  protected readonly actionable = computed(() => !!this.message() && isOpen(this.message()!.state));
  protected readonly failed = computed(() => this.message()?.attempts.filter((a) => a.outcome === 'failed').length ?? 0);

  protected act(out: { emit(m: DlqMessage): void }): void {
    const m = this.message();
    if (m) out.emit(m);
  }
}
