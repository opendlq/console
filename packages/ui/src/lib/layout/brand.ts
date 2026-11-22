import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { OdlqIcon } from '../icon/icon';

/** Marca do OpenDLQ (envelope + selo de reprocessar; igual a `assets/opendlq-mark.svg`, verde escuro + limão nos dois temas) + nome (e caret opcional quando há seletor de ambiente). */
@Component({
  selector: 'odlq-brand',
  imports: [OdlqIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg class="mark" viewBox="0 0 64 64" aria-hidden="true">
      <rect class="tile" width="64" height="64" rx="16" />
      <g class="env"><rect x="11" y="16" width="38" height="27" rx="6" /><path d="m14 21 16 12 16-12" /></g>
      <circle class="badge" cx="47" cy="46" r="11.5" />
      <g class="undo" transform="translate(40.6 39.6) scale(.53)"><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></g>
    </svg>
    <span class="name">{{ name() }}</span>
    @if (selector()) {
      <odlq-icon name="chevron-down" [size]="14" class="caret" />
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }
    .mark {
      flex: none;
      width: 32px;
      height: 32px;
    }
    .tile {
      fill: #14532d;
    }
    .env,
    .undo {
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .env {
      stroke: #ecfccb;
      stroke-width: 4;
    }
    .badge {
      fill: #a3e635;
      stroke: #14532d;
      stroke-width: 4;
    }
    .undo {
      stroke: #0b2412;
      stroke-width: 3.6;
    }
    .name {
      overflow: hidden;
      font-size: var(--ui-text-lg);
      font-weight: 700;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .caret {
      margin-left: auto;
      color: var(--ui-text-subtle);
    }
    :host-context(odlq-sidebar[data-collapsed='true']) .name,
    :host-context(odlq-sidebar[data-collapsed='true']) .caret {
      display: none;
    }
  `,
})
export class OdlqBrand {
  readonly name = input('OpenDLQ');
  readonly selector = input(false, { transform: booleanAttribute });
}
