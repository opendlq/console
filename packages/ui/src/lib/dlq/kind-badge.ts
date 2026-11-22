import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { OdlqBadge } from '../badge/badge';
import { KINDS, type FailureKind } from '../domain';

/** Tipo de falha: `transient` (retentar ajuda), `permanent` (nunca ajuda) ou `unknown`. */
@Component({
  selector: 'odlq-kind-badge',
  imports: [OdlqBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<odlq-badge mono [tone]="meta().tone" [attr.title]="meta().hint">{{ kind() }}</odlq-badge>`,
  styles: `
    :host {
      display: inline-flex;
    }
  `,
})
export class OdlqKindBadge {
  readonly kind = input.required<FailureKind>();
  protected readonly meta = computed(() => KINDS[this.kind()]);
}
