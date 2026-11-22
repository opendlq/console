import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, effect, inject, signal } from '@angular/core';

export type OdlqTheme = 'light' | 'dark';

const STORAGE_KEY = 'odlq-theme';
const isTheme = (v: unknown): v is OdlqTheme => v === 'light' || v === 'dark';

/**
 * Tema claro/escuro. O atributo `data-theme` do <html> é a fonte da verdade: o serviço
 * o grava, persiste a escolha e também reage quando outro código (ex.: Storybook) o altera.
 */
@Injectable({ providedIn: 'root' })
export class OdlqThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly root = this.doc.documentElement;
  readonly theme = signal<OdlqTheme>(this.initial());

  constructor() {
    effect(() => {
      const theme = this.theme();
      this.root.dataset['theme'] = theme;
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        /* storage indisponível: segue sem persistir */
      }
    });

    const MO = this.doc.defaultView?.MutationObserver;
    if (MO) {
      const observer = new MO(() => {
        const external = this.root.dataset['theme'];
        if (isTheme(external)) this.theme.set(external);
      });
      observer.observe(this.root, { attributes: true, attributeFilter: ['data-theme'] });
      inject(DestroyRef).onDestroy(() => observer.disconnect());
    }
  }

  toggle(): void {
    this.theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  private initial(): OdlqTheme {
    const fromDom = this.root.dataset['theme'];
    if (isTheme(fromDom)) return fromDom;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isTheme(saved)) return saved;
    } catch {
      /* ignora */
    }
    return this.doc.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
