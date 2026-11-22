import { ChangeDetectionStrategy, Component, booleanAttribute, inject, input, model } from '@angular/core';
import { OdlqIconButton } from '../button/icon-button';
import { OdlqIcon } from '../icon/icon';
import type { OdlqIconName } from '../icon/icons';
import { OdlqThemeService } from '../theme/theme';

/** Barra lateral: slot `[brand]`, navegação (seções + itens) e rodapé com tema/recolher. */
@Component({
  selector: 'odlq-sidebar',
  imports: [OdlqIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-collapsed]': 'collapsed()' },
  template: `
    <div class="brand"><ng-content select="[brand]" /></div>
    <nav class="nav" [attr.aria-label]="label()"><ng-content /></nav>
    <div class="footer">
      <button
        odlq-icon-button
        variant="outline"
        size="sm"
        round
        [icon]="theme.theme() === 'dark' ? 'sun' : 'moon'"
        [label]="theme.theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
        (click)="theme.toggle()"
      ></button>
      <button
        odlq-icon-button
        variant="outline"
        size="sm"
        round
        [icon]="collapsed() ? 'chevron-right' : 'chevron-left'"
        [label]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
        [attr.aria-expanded]="!collapsed()"
        (click)="collapsed.set(!collapsed())"
      ></button>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: var(--ui-sidebar-w);
      height: 100%;
      padding: 12px;
      border-right: 1px solid var(--ui-border);
      background: var(--ui-surface);
      transition: width var(--ui-transition);
      overflow: hidden;
    }
    :host([data-collapsed='true']) {
      width: var(--ui-sidebar-w-collapsed);
      padding-inline: 10px;
    }
    .brand {
      display: flex;
      align-items: center;
      min-height: 40px;
      padding-bottom: 8px;
    }
    .nav {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 2px;
      overflow-y: auto;
    }
    .footer {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
      padding: 8px 0 0 2px;
    }
  `,
})
export class OdlqSidebar {
  protected readonly theme = inject(OdlqThemeService);
  readonly collapsed = model(false);
  readonly label = input('Main navigation');
}

/** Cabeçalho de seção (MAIN, OTHERS, SELF-SERVICE…). */
@Component({
  selector: 'odlq-nav-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'group', '[attr.aria-label]': 'label()' },
  template: `<span class="label" aria-hidden="true">{{ label() }}</span><ng-content />`,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-top: 12px;
    }
    .label {
      padding: 4px 8px;
      color: var(--ui-text-subtle);
      font: 500 var(--ui-text-2xs) / 1 var(--ui-font-mono);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    :host-context(odlq-sidebar[data-collapsed='true']) .label {
      visibility: hidden;
      height: 6px;
      padding: 0;
    }
  `,
})
export class OdlqNavSection {
  readonly label = input.required<string>();
}

/**
 * Item de navegação. Use em `<a>` (com `routerLink`) ou `<button>`.
 * O estado ativo vem de `[active]` ou da classe `active` (ex.: `routerLinkActive="active"`).
 */
@Component({
  selector: 'a[odlq-nav-item], button[odlq-nav-item]',
  imports: [OdlqIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-active]': 'active() || null', '[attr.aria-current]': 'active() ? "page" : null' },
  template: `
    @if (icon(); as name) {
      <odlq-icon [name]="name" [size]="16" class="ico" />
    }
    <span class="text"><ng-content /></span>
    @if (badge()) {
      <span class="badge">{{ badge() }}</span>
    }
    @if (count() !== null) {
      <span class="count">{{ count() }}</span>
    }
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 10px;
      height: 32px;
      padding: 0 8px;
      border: 0;
      border-radius: var(--ui-radius-md);
      background: transparent;
      color: var(--ui-text);
      font-size: var(--ui-text-md);
      font-weight: 500;
      text-align: left;
      text-decoration: none;
      cursor: pointer;
      transition: background var(--ui-transition);
    }
    :host(:hover) {
      background: var(--ui-surface-hover);
    }
    :host([data-active]),
    :host(.active) {
      background: var(--ui-primary-soft);
      color: var(--ui-primary-soft-fg);
    }
    :host(:focus-visible) {
      outline: none;
      box-shadow: var(--ui-focus-ring);
    }
    .ico {
      color: var(--ui-text-muted);
    }
    :host([data-active]) .ico,
    :host(.active) .ico {
      color: inherit;
    }
    .text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .badge {
      padding: 2px 5px;
      border: 1px solid var(--ui-border-strong);
      border-radius: var(--ui-radius-sm);
      color: var(--ui-text-muted);
      font: 500 var(--ui-text-2xs) / 1 var(--ui-font-mono);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .count {
      min-width: 18px;
      padding: 2px 5px;
      border-radius: var(--ui-radius-sm);
      background: var(--ui-danger);
      color: #fff;
      font-size: var(--ui-text-2xs);
      text-align: center;
    }
    :host-context(odlq-sidebar[data-collapsed='true']) .text,
    :host-context(odlq-sidebar[data-collapsed='true']) .badge,
    :host-context(odlq-sidebar[data-collapsed='true']) .count {
      display: none;
    }
    :host-context(odlq-sidebar[data-collapsed='true']) {
      justify-content: center;
    }
  `,
})
export class OdlqNavItem {
  readonly icon = input<OdlqIconName | null>(null);
  readonly active = input(false, { transform: booleanAttribute });
  /** Etiqueta curta à direita (PREVIEW, BETA). */
  readonly badge = input('');
  /** Contador à direita (ex.: pendências). */
  readonly count = input<number | null>(null);
}
