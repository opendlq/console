import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { OdlqIcon } from '../icon/icon';
import { OdlqTabs, type OdlqTab } from '../tabs/tabs';

/** Painel de documentação inline ("Documentation: Basics / Parameters / Functions / Examples"). */
@Component({
  selector: 'odlq-doc-panel',
  imports: [OdlqIcon, OdlqTabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="head">
      <odlq-icon name="book" [size]="16" />
      <h3>{{ heading() }}</h3>
    </div>
    <odlq-tabs [tabs]="tabs()" [(selected)]="selected" [label]="heading()" />
    <div class="body"><ng-content /></div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      border-radius: var(--ui-radius-lg);
      background: var(--ui-surface-muted);
    }
    .head {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--ui-text-muted);
    }
    h3 {
      margin: 0;
      color: var(--ui-text);
      font-size: var(--ui-text-md);
      font-weight: 600;
    }
    .body {
      color: var(--ui-text-muted);
      font-size: var(--ui-text-sm);
      line-height: 1.6;
    }
  `,
})
export class OdlqDocPanel {
  readonly heading = input('Documentation');
  readonly tabs = input.required<OdlqTab[]>();
  readonly selected = model('');
}
