import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Avatar circular: imagem (`src`) ou iniciais de `name`. */
@Component({
  selector: 'odlq-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'img',
    '[attr.aria-label]': 'name()',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
    '[style.font-size.px]': 'size() * 0.42',
  },
  template: `@if (src()) {<img [src]="src()" alt="" />} @else {{{ initials() }}}`,
  styles: `
    :host {
      display: inline-grid;
      place-items: center;
      flex: none;
      overflow: hidden;
      border-radius: 50%;
      background: var(--ui-primary-soft);
      color: var(--ui-primary-soft-fg);
      font-weight: 600;
      line-height: 1;
      user-select: none;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `,
})
export class OdlqAvatar {
  readonly name = input('');
  readonly src = input('');
  readonly size = input(28);
  protected readonly initials = computed(() =>
    this.name()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join(''),
  );
}
