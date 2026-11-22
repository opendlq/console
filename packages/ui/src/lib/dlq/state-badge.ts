import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { OdlqBadge } from '../badge/badge';
import { STATES, type MessageState } from '../domain';

/** Estado de uma mensagem na máquina de estados do OpenDLQ (`awaiting_operator`, `held`, `recovered`…). */
@Component({
  selector: 'odlq-state-badge',
  imports: [OdlqBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<odlq-badge mono [dot]="true" [tone]="meta().tone" [attr.title]="meta().hint">{{ text() }}</odlq-badge>`,
  styles: `
    :host {
      display: inline-flex;
    }
  `,
})
export class OdlqStateBadge {
  readonly state = input.required<MessageState>();
  protected readonly meta = computed(() => STATES[this.state()]);
  protected readonly text = computed(() => this.state().replaceAll('_', ' '));
}
