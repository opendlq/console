import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface OdlqAttempt {
  at: string;
  outcome: 'failed' | 'succeeded' | 'queued';
  message?: string;
  durationMs?: number;
}

/** Histórico de tentativas de reprocessamento, da mais antiga à mais recente. */
@Component({
  selector: 'odlq-attempt-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'list', 'aria-label': 'Attempt history' },
  template: `
    @for (a of attempts(); track $index; let i = $index) {
      <div class="item" role="listitem" [attr.data-outcome]="a.outcome">
        <span class="dot" aria-hidden="true"></span>
        <div class="body">
          <div class="top">
            <strong>#{{ i + 1 }} · {{ label(a.outcome) }}</strong>
            <span class="at">{{ a.at }}</span>
            @if (a.durationMs !== undefined) {
              <span class="at">{{ a.durationMs }} ms</span>
            }
          </div>
          @if (a.message) {
            <p>{{ a.message }}</p>
          }
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
    }
    .item {
      position: relative;
      display: flex;
      gap: 12px;
      padding-bottom: 16px;
    }
    .item:not(:last-child)::before {
      content: '';
      position: absolute;
      top: 14px;
      bottom: 0;
      left: 4.5px;
      width: 1px;
      background: var(--ui-border-strong);
    }
    .dot {
      flex: none;
      width: 10px;
      height: 10px;
      margin-top: 4px;
      border-radius: 50%;
      background: var(--ui-text-subtle);
    }
    [data-outcome='failed'] .dot {
      background: var(--ui-danger);
    }
    [data-outcome='succeeded'] .dot {
      background: var(--ui-success-solid);
    }
    .top {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 4px 10px;
    }
    strong {
      font-size: var(--ui-text-md);
      font-weight: 600;
    }
    .at {
      color: var(--ui-text-subtle);
      font: var(--ui-text-xs) var(--ui-font-mono);
    }
    p {
      margin: 2px 0 0;
      color: var(--ui-text-muted);
      font-size: var(--ui-text-sm);
    }
  `,
})
export class OdlqAttemptTimeline {
  readonly attempts = input.required<OdlqAttempt[]>();
  protected label(o: OdlqAttempt['outcome']): string {
    return { failed: 'Failed', succeeded: 'Succeeded', queued: 'Queued' }[o];
  }
}
