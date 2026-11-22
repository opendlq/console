import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { OPEN_STATES, STATES, type MessageState } from '../domain';

/** Mensagens abertas por estado, na ordem do fluxo. Clicar num estado o seleciona como filtro. */
@Component({
  selector: 'odlq-state-strip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'group', 'aria-label': 'Open messages by state' },
  template: `
    @for (s of states; track s) {
      <button type="button" [attr.aria-pressed]="selected() === s" [attr.data-tone]="tone(s)" [attr.title]="hint(s)" (click)="selected.set(selected() === s ? null : s)">
        <strong>{{ counts()[s] ?? 0 }}</strong>
        <span>{{ s.replaceAll('_', ' ') }}</span>
      </button>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    button {
      display: flex;
      min-width: 112px;
      flex-direction: column;
      gap: 2px;
      padding: 8px 12px;
      border: 1px solid var(--ui-border);
      border-left: 3px solid var(--c, var(--ui-border-strong));
      border-radius: var(--ui-radius-md);
      background: var(--ui-surface);
      color: var(--ui-text);
      font: inherit;
      text-align: start;
      cursor: pointer;
    }
    button:hover {
      background: var(--ui-surface-hover);
    }
    button[aria-pressed='true'] {
      border-color: var(--ui-primary);
      background: var(--ui-primary-soft);
    }
    [data-tone='warning'] {
      --c: var(--ui-warning);
    }
    [data-tone='danger'] {
      --c: var(--ui-danger);
    }
    [data-tone='info'] {
      --c: var(--ui-info);
    }
    [data-tone='primary'] {
      --c: var(--ui-chart-1);
    }
    strong {
      font-size: var(--ui-text-2xl);
      font-weight: 600;
      line-height: 1.1;
      font-variant-numeric: tabular-nums;
    }
    span {
      color: var(--ui-text-muted);
      font: var(--ui-text-xs) var(--ui-font-mono);
    }
  `,
})
export class OdlqStateStrip {
  readonly counts = input.required<Partial<Record<MessageState, number>>>();
  readonly selected = model<MessageState | null>(null);
  protected readonly states = OPEN_STATES;
  protected tone = (s: MessageState) => STATES[s].tone;
  protected hint = (s: MessageState) => STATES[s].hint;
}
