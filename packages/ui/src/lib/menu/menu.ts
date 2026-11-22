import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, Directive, inject, input } from '@angular/core';
import { OdlqIcon } from '../icon/icon';
import type { OdlqIconName } from '../icon/icons';

/**
 * Menu de ações (CDK Menu: foco, setas, typeahead e Esc prontos).
 *
 *   <button odlq-icon-button icon="more" label="Actions" [odlqMenuTrigger]="actions"></button>
 *   <ng-template #actions>
 *     <odlq-menu>
 *       <button odlq-menu-item icon="eraser">Empty topic</button>
 *       <button odlq-menu-item icon="trash" tone="danger">Delete topic</button>
 *     </odlq-menu>
 *   </ng-template>
 */
@Component({
  selector: 'odlq-menu',
  hostDirectives: [CdkMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-width: 176px;
      padding: 4px;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-lg);
      background: var(--ui-surface);
      box-shadow: var(--ui-shadow-md);
    }
  `,
})
export class OdlqMenu {}

@Component({
  selector: 'button[odlq-menu-item], a[odlq-menu-item]',
  imports: [OdlqIcon],
  hostDirectives: [{ directive: CdkMenuItem, inputs: ['cdkMenuItemDisabled: disabled'] }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-tone]': 'tone()' },
  template: `
    @if (icon(); as name) {
      <odlq-icon [name]="name" [size]="14" />
    }
    <ng-content />
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 32px;
      padding: 0 10px;
      border: 0;
      border-radius: var(--ui-radius-md);
      background: transparent;
      color: var(--ui-text);
      font-size: var(--ui-text-md);
      text-align: left;
      text-decoration: none;
      cursor: pointer;
    }
    :host(:hover),
    :host(:focus-visible) {
      outline: 0;
      background: var(--ui-surface-hover);
    }
    :host([data-tone='danger']) {
      color: var(--ui-danger);
    }
    :host([aria-disabled='true']) {
      opacity: 0.5;
      pointer-events: none;
    }
  `,
})
export class OdlqMenuItem {
  readonly icon = input<OdlqIconName | null>(null);
  readonly tone = input<'default' | 'danger'>('default');
}

@Component({
  selector: 'odlq-menu-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'separator' },
  template: ``,
  styles: `
    :host {
      display: block;
      height: 1px;
      margin: 4px -4px;
      background: var(--ui-border);
    }
  `,
})
export class OdlqMenuSeparator {}

/** Gatilho do menu; abre alinhado à borda direita, abaixo do botão. */
@Directive({
  selector: '[odlqMenuTrigger]',
  hostDirectives: [{ directive: CdkMenuTrigger, inputs: ['cdkMenuTriggerFor: odlqMenuTrigger'] }],
})
export class OdlqMenuTrigger {
  constructor() {
    inject(CdkMenuTrigger).menuPosition = [
      { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
      { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -4 },
    ];
  }
}
