import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Estado vazio com ilustração de traço. Slot `[actions]` para a ação principal. */
@Component({
  selector: 'odlq-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'status' },
  template: `
    @switch (illustration()) {
      @case ('inbox') {
        <svg viewBox="0 0 160 120" aria-hidden="true" class="art">
          <path d="M28 70 44 32h72l16 38v28a6 6 0 0 1-6 6H34a6 6 0 0 1-6-6z" />
          <path d="M28 70h36a16 16 0 0 0 32 0h36" />
          <path class="accent" d="m64 50 12 12 22-24" />
        </svg>
      }
      @default {
        <svg viewBox="0 0 160 120" aria-hidden="true" class="art">
          <path d="M92 112V74" />
          <path d="M60 68V50c0-10 8-16 18-16h20c12 0 22 10 22 22v12z" />
          <ellipse cx="60" cy="56" rx="8" ry="12" />
          <path d="M60 68h60" />
          <path class="accent" d="M118 34V20" />
          <path class="accent" d="M118 20h12v8h-12" />
          <path d="M66 48l10 10M76 48 66 58M70 52h10M72 46v14" stroke-width="1" />
          <rect x="94" y="6" width="34" height="22" rx="5" class="bubble" />
          <path d="M104 28l-4 7 12-7" class="bubble" />
          <text x="111" y="22" text-anchor="middle" class="zero">0</text>
          <path d="M20 112h120" />
        </svg>
      }
    }
    <p class="title">{{ title() }}</p>
    @if (description()) {
      <p class="desc">{{ description() }}</p>
    }
    <div class="actions"><ng-content select="[actions]" /></div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 48px 16px;
      text-align: center;
    }
    .art {
      width: 168px;
      height: auto;
      margin-bottom: 8px;
      fill: none;
      stroke: var(--ui-text);
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .accent {
      stroke: var(--ui-primary);
    }
    .bubble {
      fill: var(--ui-surface);
      stroke: var(--ui-text);
    }
    .zero {
      fill: var(--ui-text);
      stroke: none;
      font: 700 14px var(--ui-font-sans);
    }
    .title {
      margin: 0;
      font-size: var(--ui-text-md);
      font-weight: 500;
    }
    .desc {
      margin: 0;
      max-width: 360px;
      color: var(--ui-text-muted);
      font-size: var(--ui-text-md);
    }
    .actions:not(:empty) {
      margin-top: 12px;
    }
  `,
})
export class OdlqEmptyState {
  readonly title = input('There aren’t any messages matching your search.');
  readonly description = input('Please, try with new parameters.');
  readonly illustration = input<'mailbox' | 'inbox'>('mailbox');
}
