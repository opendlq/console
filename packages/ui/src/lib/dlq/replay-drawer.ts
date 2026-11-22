import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, model, output } from '@angular/core';
import { OdlqButton } from '../button/button';
import { OdlqCodeEditor } from '../code/code-editor';
import { prettyPayload, type DlqMessage } from '../domain';
import { OdlqDrawer } from '../drawer/drawer';
import { OdlqFormField } from '../form-field/form-field';
import { OdlqIcon } from '../icon/icon';
import { OdlqInput } from '../input/input';
import { OdlqSelect } from '../select/select';
import type { OdlqOption } from '../types';

export interface OdlqReplayRequest {
  /** Destino do replay: o tópico original ou outro alvo. */
  target: string;
  /** Mensagens por segundo (limite do lote). */
  rate: number;
  /** Payload editado (só em "Edit and replay" de uma mensagem). */
  payload?: string;
}

/**
 * Replay de uma mensagem ou lote: destino, limite de taxa e, opcionalmente, edição do payload.
 * A chave de partição e o `x-dlq-id` (idempotência) são mantidos; o replay nunca sai da chave original.
 */
@Component({
  selector: 'odlq-replay-drawer',
  imports: [OdlqDrawer, OdlqButton, OdlqFormField, OdlqSelect, OdlqInput, OdlqCodeEditor, OdlqIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <odlq-drawer [(open)]="open" [heading]="edit() ? 'Edit and replay' : 'Replay'" [back]="true" [width]="width()" [placement]="placement()" (backClick)="open.set(false)">
      <p class="intro">
        Replays {{ messages().length }} {{ messages().length === 1 ? 'message' : 'messages' }} with an idempotency key (<code>x-dlq-id</code>),
        keeping the original partition key and order. The audit log records who did it.
      </p>
      <div class="form">
        <odlq-form-field label="Destination" [required]="true">
          <odlq-select [options]="targets()" [(value)]="target" label="Destination" />
        </odlq-form-field>
        @if (messages().length > 1) {
          <odlq-form-field label="Rate limit" hint="Messages per second, so a recovering dependency is not flooded">
            <odlq-input type="number" [(value)]="rate" label="Rate limit (msg/s)" />
          </odlq-form-field>
        }
        @if (edit() && single()) {
          <odlq-form-field label="Payload" hint="Changed here, replayed under the same x-dlq-id">
            <odlq-code-editor language="json" [rows]="12" [(value)]="payload" [lineNumbers]="true" label="Payload" />
          </odlq-form-field>
        }
      </div>
      <ng-container footer>
        <button odlq-button variant="secondary" (click)="open.set(false)">Cancel</button>
        <button odlq-button variant="primary" [disabled]="!target() || invalidRate()" (click)="publish()">
          {{ edit() ? 'Edit and replay' : 'Replay' }} <odlq-icon name="send" [size]="14" />
        </button>
      </ng-container>
    </odlq-drawer>
  `,
  styles: `
    .intro {
      margin: 0 0 16px;
      color: var(--ui-text-muted);
      font-size: var(--ui-text-md);
    }
    code {
      font: var(--ui-text-sm) var(--ui-font-mono);
    }
    .form {
      display: grid;
      gap: 16px;
    }
    odlq-select,
    odlq-input,
    odlq-code-editor {
      display: block;
    }
  `,
})
export class OdlqReplayDrawer {
  readonly open = model(false);
  readonly messages = input<DlqMessage[]>([]);
  readonly targets = input<OdlqOption[]>([]);
  /** Mostra o editor de payload (só vale para uma mensagem). */
  readonly edit = input(false);
  readonly width = input('520px');
  readonly placement = input<'viewport' | 'container'>('viewport');
  readonly replay = output<OdlqReplayRequest>();

  protected readonly single = computed(() => this.messages().length === 1);
  protected readonly target = linkedSignal<string | null>(() => this.messages()[0]?.originalTopic ?? this.targets()[0]?.value ?? null);
  protected readonly rate = linkedSignal(() => '50');
  protected readonly payload = linkedSignal(() => prettyPayload(this.messages()[0]?.payload ?? ''));
  protected readonly invalidRate = computed(() => this.messages().length > 1 && !(Number(this.rate()) > 0));

  protected publish(): void {
    this.replay.emit({
      target: this.target()!,
      rate: Number(this.rate()) || 50,
      payload: this.edit() && this.single() ? this.payload() : undefined,
    });
    this.open.set(false);
  }
}
