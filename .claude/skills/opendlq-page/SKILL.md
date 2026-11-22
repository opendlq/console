---
name: opendlq-page
description: Cria ou altera uma página (rota) do console OpenDLQ em apps/console. Use sempre que for adicionar/editar uma página, rota, tela ou "page" do app. Toda página tem seu próprio .ts, .html e .css (nunca inline), a lógica e os testes ficam em packages/modules, e páginas não têm teste.
---

# Página do console OpenDLQ

Uma página é só **composição de UI**. A lógica, o estado e os testes ficam em `@opendlq/modules`.

## Estrutura (uma pasta por página)

```
apps/console/src/app/pages/<nome>/
├─ <nome>.ts     # classe fina: injeta a store, liga eventos, efeitos de tela
├─ <nome>.html   # template
└─ <nome>.css    # estilos
```

- Sem sufixo `.component`. Seletor `odlq-<nome>-page`, classe `<Nome>Page`.
- **Nunca** `template:` / `styles:` inline em página: use `templateUrl: './<nome>.html'` e `styleUrl: './<nome>.css'`.
- `changeDetection: ChangeDetectionStrategy.OnPush`, `@if`/`@for`, `input()`/`output()`/`signal()`.
- **Não crie `*.spec.ts` para páginas.** Teste de lógica fica no módulo; fluxo que dispara request fica no Playwright (`opendlq-e2e`). Arquitetura e dependências: `opendlq-architecture`.

## Onde fica cada coisa

| Coisa | Onde |
|---|---|
| Componentes visuais (tabela, drawer, KPI, filtros…) | `@opendlq/ui` (importe de lá; não recrie) |
| Estado, regras, filtros, ações (reprocessar, descartar…), dados | `packages/modules/src/<modulo>/` |
| Testes da lógica | `packages/modules/src/<modulo>/*.spec.ts` |
| Definição de colunas, estado de abrir/fechar drawer, toast, download, navegação | página (`.ts`) |
| Layout/espaçamento da tela | `<nome>.css` |

Regra de bolso: se dá para testar sem DOM, vai para o módulo; se depende de `Router`, `document` ou toast, fica na página.

## Passo a passo

1. **Módulo** (se ainda não existir): siga `opendlq-module` (store com signals, fixture, `public-api.ts`). Estado por tela: sem `providedIn: 'root'` e `providers: [Store]` na página; estado global: `providedIn: 'root'`.
2. **Teste** do módulo em `<modulo>.store.spec.ts`, também em `opendlq-module`.
3. **Página**: crie a pasta com `.ts`, `.html`, `.css`.
   - `.ts`: `inject(Store)` como `protected readonly store`, `imports` só do que o `.html` usa.
   - `.html`: bind direto na store (`[(value)]="store.query"`, `store.rows()`, `(filterRemoved)="store.removeFilter($event)"`). Sem lógica além de chamadas.
4. **Rota** em `apps/console/src/app/app.routes.ts`, sempre lazy: `loadComponent: () => import('./pages/<nome>/<nome>').then((m) => m.<Nome>Page)`.
5. Item de menu em `apps/console/src/app/app.ts` (sidebar) se for página de primeiro nível.

## Esqueleto

```ts
// pages/exemplo/exemplo.ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ExemploStore } from '@opendlq/modules';
import { OdlqPageHeader } from '@opendlq/ui';

@Component({
  selector: 'odlq-exemplo-page',
  imports: [OdlqPageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './exemplo.html',
  styleUrl: './exemplo.css',
})
export class ExemploPage {
  protected readonly store = inject(ExemploStore);
}
```

```html
<!-- pages/exemplo/exemplo.html -->
<div class="page">
  <odlq-page-header title="Exemplo" />
</div>
```

```css
/* pages/exemplo/exemplo.css */
.page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
```

## Conferir

```bash
pnpm test        # ui + modules + console
pnpm build       # ui + modules + console
pnpm dev         # http://localhost:4200
```

Exemplos reais: `pages/failures/` (lista de causas) e `pages/failure/` (uma causa, com drawers e diálogos), com a lógica em `packages/modules/src/failures/`.
