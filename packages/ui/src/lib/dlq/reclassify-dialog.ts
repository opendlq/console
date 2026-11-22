import { ChangeDetectionStrategy, Component, input, linkedSignal, model, output } from '@angular/core';
import { OdlqButton } from '../button/button';
import type { FailureKind } from '../domain';
import { OdlqModal } from '../modal/modal';
import { OdlqSegmentedControl } from '../segmented-control/segmented-control';
import type { OdlqOption } from '../types';

const OPTIONS: OdlqOption<FailureKind>[] = [
  { value: 'transient', label: 'Transient' },
  { value: 'permanent', label: 'Permanent' },
];

/** Reclassifica mensagens ou grupos. Permanente → transitório devolve ao caminho de retentativa; o contrário espera um operador. */
@Component({
  selector: 'odlq-reclassify-dialog',
  imports: [OdlqModal, OdlqSegmentedControl, OdlqButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <odlq-modal [(open)]="open" heading="Reclassify failure">
      <p class="msg">Change the kind of {{ count() }} {{ noun() }}. The Policy Engine routes them again with your classification.</p>
      <odlq-segmented-control [options]="options" [(value)]="kind" label="Failure kind" />
      <p class="hint">
        @if (kind() === 'transient') {
          They go back to <strong>retrying</strong>, with backoff and circuit breaker.
        } @else {
          They wait in <strong>awaiting operator</strong> and are never retried on their own.
        }
      </p>
      <ng-container footer>
        <button odlq-button variant="secondary" (click)="open.set(false)">Cancel</button>
        <button odlq-button variant="primary" [disabled]="!kind()" (click)="reclassify.emit(kind()!); open.set(false)">Reclassify</button>
      </ng-container>
    </odlq-modal>
  `,
  styles: `
    .msg {
      margin: 0 0 12px;
      color: var(--ui-text-muted);
      font-size: var(--ui-text-md);
    }
    .hint {
      margin: 12px 0 0;
      color: var(--ui-text-muted);
      font-size: var(--ui-text-sm);
    }
  `,
})
export class OdlqReclassifyDialog {
  readonly open = model(false);
  readonly count = input(1);
  readonly noun = input('message(s)');
  /** Tipo atual; a seleção começa no oposto. */
  readonly current = input<FailureKind>('permanent');
  readonly reclassify = output<FailureKind>();
  protected readonly options = OPTIONS;
  protected readonly kind = linkedSignal<FailureKind | null>(() => (this.current() === 'transient' ? 'permanent' : 'transient'));
}
