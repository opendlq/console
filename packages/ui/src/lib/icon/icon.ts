import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { ICONS, type OdlqIconName } from './icons';

/** Ícone SVG do conjunto curado (`ICONS`). Herda `currentColor`. Decorativo por padrão. */
@Component({
  selector: 'odlq-icon',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
  },
  template: `<svg [lucideIcon]="glyph()" [size]="size()" [strokeWidth]="strokeWidth()" />`,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      line-height: 0;
    }
  `,
})
export class OdlqIcon {
  /** Nome semântico do ícone (ver `ICON_NAMES`). */
  readonly name = input.required<OdlqIconName>();
  /** Lado em px. */
  readonly size = input(16);
  readonly strokeWidth = input(1.75);
  /** Texto acessível; sem ele o ícone é `aria-hidden`. */
  readonly label = input<string>('');

  protected readonly glyph = computed(() => ICONS[this.name()]);
}
