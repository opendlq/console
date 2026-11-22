import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { OdlqBadge } from '../badge/badge';
import { formatAge, type Breaker, type BreakerState } from '../domain';
import { OdlqProgress } from '../progress/progress';
import type { OdlqTone } from '../types';

const TONE: Record<BreakerState, OdlqTone> = { closed: 'success', open: 'danger', draining: 'info' };

/** Circuit breaker de uma dependência: estado, falhas na janela, mensagens retidas, probe e drenagem. */
@Component({
  selector: 'odlq-breaker-card',
  imports: [OdlqBadge, OdlqProgress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="head">
      <div>
        <h2>{{ breaker().dependency }}</h2>
        <span class="sub">{{ breaker().consumer }}</span>
      </div>
      <odlq-badge mono [dot]="true" [tone]="tone()">{{ breaker().state }}</odlq-badge>
    </div>
    <div class="gauge">
      <div class="lbl">
        <span>Transient failures · {{ breaker().windowSec }}s window</span>
        <strong>{{ breaker().windowFailures }} / {{ breaker().threshold }}</strong>
      </div>
      <odlq-progress [value]="breaker().windowFailures" [max]="breaker().threshold" [tone]="breaker().windowFailures >= breaker().threshold ? 'danger' : 'primary'" label="Failures against the breaker threshold" />
    </div>
    <dl>
      <dt>Held messages</dt><dd>{{ held() }}</dd>
      <dt>Probe</dt><dd>{{ probe() }}</dd>
      <dt>Drain rate</dt><dd>{{ breaker().drainRate }} msg/s</dd>
      @if (breaker().openedMin !== undefined) {
        <dt>{{ breaker().state === 'open' ? 'Open for' : 'Closed' }}</dt><dd>{{ age() }}</dd>
      }
    </dl>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-lg);
      background: var(--ui-surface);
    }
    :host([data-state='open']) {
      border-color: var(--ui-danger-border);
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
    dl {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 6px 16px;
      margin: 0;
      font-size: var(--ui-text-md);
    }
    dt {
      color: var(--ui-text-muted);
    }
    dd {
      margin: 0;
      text-align: end;
      font: var(--ui-text-sm) var(--ui-font-mono);
    }
  `,
  host: { '[attr.data-state]': 'breaker().state' },
})
export class OdlqBreakerCard {
  readonly breaker = input.required<Breaker>();
  /** Mensagens em `held` por causa deste breaker. */
  readonly held = input(0);
  protected readonly tone = computed(() => TONE[this.breaker().state]);
  protected readonly age = computed(() => formatAge(this.breaker().openedMin ?? 0));
  protected readonly probe = computed(() => {
    const p = this.breaker().probe;
    const next = this.breaker().state === 'open' ? ` · next in ${p.nextInSec}s` : '';
    return `${p.type.replace('_', ' ')} every ${p.everySec}s${next}`;
  });
}
