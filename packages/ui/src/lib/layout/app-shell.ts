import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Esqueleto da aplicação: `<odlq-sidebar>` à esquerda, `<odlq-topbar>` no topo e o
 * conteúdo da página na área rolável.
 */
@Component({
  selector: 'odlq-app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.height]': 'height()' },
  template: `
    <ng-content select="odlq-sidebar" />
    <div class="main">
      <ng-content select="odlq-topbar" />
      <main class="content"><ng-content /></main>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      background: var(--ui-bg);
      color: var(--ui-text);
      min-height: 0;
    }
    .main {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-width: 0;
      position: relative;
    }
    .content {
      flex: 1;
      min-height: 0;
      overflow: auto;
      padding: 20px 28px 32px;
    }
  `,
})
export class OdlqAppShell {
  readonly height = input('100vh');
}
