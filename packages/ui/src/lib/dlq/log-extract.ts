import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { OdlqBadge } from '../badge/badge';
import type { Enrichment, EnrichmentStatus } from '../domain';
import { OdlqIcon } from '../icon/icon';
import type { OdlqTone } from '../types';

const STATUS: Record<EnrichmentStatus, { tone: OdlqTone; text: string }> = {
  enriched: { tone: 'success', text: 'Logs found by the Enricher' },
  reused: { tone: 'success', text: 'Reused from a recent message of the same group' },
  not_found: { tone: 'warning', text: 'No matching logs for the correlation ids' },
  unavailable: { tone: 'danger', text: 'Logs unavailable: the source failed or timed out' },
  skipped: { tone: 'neutral', text: 'No log source configured for this consumer' },
};

/** Logs correlacionados: extrato guardado pelo Enricher, status da busca e links para os logs e o trace. */
@Component({
  selector: 'odlq-log-extract',
  imports: [OdlqBadge, OdlqIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="status">
      <odlq-badge mono [tone]="status().tone">{{ enrichment().status.replace('_', ' ') }}</odlq-badge>
      <span>{{ status().text }}</span>
    </div>
    @if (enrichment().logs.length) {
      <div class="logs" role="log" aria-label="Correlated log extract">
        @for (l of enrichment().logs; track $index) {
          <div class="line" [attr.data-level]="l.level">
            <span class="at">{{ l.at }}</span><span class="lvl">{{ l.level }}</span><span class="txt">{{ l.text }}</span>
          </div>
        }
      </div>
    }
    @if (enrichment().logsUrl || enrichment().traceUrl) {
      <div class="links">
        @if (enrichment().logsUrl) {
          <a [href]="enrichment().logsUrl" target="_blank" rel="noopener noreferrer"><odlq-icon name="external-link" [size]="12" /> Open logs</a>
        }
        @if (enrichment().traceUrl) {
          <a [href]="enrichment().traceUrl" target="_blank" rel="noopener noreferrer"><odlq-icon name="external-link" [size]="12" /> Open trace</a>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: 10px;
    }
    .status {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--ui-text-muted);
      font-size: var(--ui-text-sm);
    }
    .logs {
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-md);
      background: var(--ui-code-bg);
    }
    .line {
      display: grid;
      grid-template-columns: 64px 40px 1fr;
      gap: 10px;
      padding: 6px 12px;
      border-bottom: 1px solid var(--ui-border);
      font: var(--ui-text-sm) / 1.5 var(--ui-font-mono);
    }
    .line:last-child {
      border-bottom: 0;
    }
    .at {
      color: var(--ui-code-lineno);
    }
    .lvl {
      color: var(--ui-text-muted);
      text-transform: uppercase;
    }
    [data-level='error'] .lvl {
      color: var(--ui-danger);
    }
    [data-level='warn'] .lvl {
      color: var(--ui-warning);
    }
    .txt {
      color: var(--ui-code-text);
      overflow-wrap: anywhere;
    }
    .links {
      display: flex;
      gap: 16px;
    }
    a {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--ui-link);
      font-size: var(--ui-text-sm);
    }
  `,
})
export class OdlqLogExtract {
  readonly enrichment = input.required<Enrichment>();
  protected readonly status = computed(() => STATUS[this.enrichment().status]);
}
