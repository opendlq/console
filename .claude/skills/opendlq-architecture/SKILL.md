---
name: opendlq-architecture
description: Arquitetura do workspace OpenDLQ (apps/console, packages/ui, packages/modules, packages/core). Use ao decidir ONDE um código deve ficar, ao criar/mover arquivos entre packages, ao revisar imports entre packages, ao lidar com dados de exemplo (__fixtures__) ou ao criar o packages/core. Para páginas use opendlq-page, para features opendlq-module, para componentes opendlq-ui-component.
---

# Arquitetura do OpenDLQ

Quatro camadas. A dependência vai **só para baixo**; nunca para cima nem para os lados.

```
apps/console   páginas: composição de UI, efeitos de tela (Router, toast, download)
     │
     ▼
packages/modules   features: stores (signals), regras, testes          @opendlq/modules
     │          ╲
     ▼           ╲
packages/core   services: acesso a dados e infra (NÃO EXISTE AINDA)    @opendlq/core
packages/ui     componentes + Storybook, sem conhecer dados            @opendlq/ui
```

## Quem pode importar quem

| Camada | Pode importar | Nunca importa |
|---|---|---|
| `ui` | `@angular/*`, `@angular/cdk`, `@lucide/angular` | `modules`, `core`, `console`, `HttpClient`, `Router` |
| `core` (futuro) | `@angular/*`, `rxjs` | `ui`, `modules`, `console` |
| `modules` | `core`, `ui` (**só tipos e funções puras de `domain.ts`**) | componentes de `ui`, `Router`, `document`, toast |
| `console` (pages) | `modules`, `ui` | `core` direto (a página passa por uma store), `ui/src/...` |

- Cada package expõe **só** `src/public-api.ts` (`exports` do `package.json` e `paths` do `tsconfig.json`). Sem import profundo.
- `peerDependencies`/`devDependencies` do `package.json` seguem a mesma seta (ver `packages/modules/package.json`).
- Componente que precisa de dado recebe por `input()`; quem busca é a store do módulo.

## Onde fica cada coisa

| Coisa | Onde | Skill |
|---|---|---|
| Botão, tabela, drawer, badge, story | `packages/ui/src/lib/<nome>/` | `opendlq-ui-component` |
| Estado, filtros, ações, regras de negócio, testes | `packages/modules/src/<modulo>/` | `opendlq-module` |
| Chamada HTTP, config, storage, auth, DTOs | `packages/core/src/<recurso>/` (quando existir) | esta skill |
| Rota, template da tela, toast, navegação | `apps/console/src/app/pages/<nome>/` | `opendlq-page` |
| Dados de exemplo | `__fixtures__/` ao lado de quem usa | esta skill |

Regra de bolso: se dá para testar sem DOM, vai para o módulo; se depende de `Router`, `document` ou toast, fica na página; se só desenha, vai para `ui`.

## Dados de exemplo: `__fixtures__`

Enquanto `packages/core` não existe, os dados vêm de fixtures.

- Pasta `__fixtures__/` **ao lado do código que as consome**: `packages/modules/src/<modulo>/__fixtures__/<nome>.fixture.ts` (dados de tela) e `packages/ui/src/lib/<nome>/__fixtures__/` (só para stories).
- Constantes `UPPER_SNAKE` (`DLQ_TOPICS`), **determinísticas**: sem `Math.random()`, sem `Date.now()`. Use um "agora" fixo (ver `MOCK_NOW` em `packages/ui/src/lib/mocks.ts`).
- Fixture guarda **dados**, não tipos. O tipo fica no store ou em `<modulo>.types.ts`.
- **Nunca** exporte fixtures no `public-api.ts`. Quem precisa do dado usa a store.
- A store lê a fixture num único ponto, o estado inicial, e marca a emenda:
  ```ts
  // ponytail: fixture; troque por inject(<Recurso>Service) do @opendlq/core quando existir.
  readonly topics = signal<DlqTopic[]>(DLQ_TOPICS);
  ```
- Um package **não** importa fixture de outro (hoje `modules` importa `DLQ_MESSAGES` de `ui`: ver dívida).

## Quando criar `packages/core`

Só quando a primeira store precisar de dado real. Espelhe `packages/modules`:

1. `packages/core/` com `package.json` (`@opendlq/core`, `exports: { ".": "./src/public-api.ts" }`, peer `@angular/core`), `tsconfig.lib.json`, `tsconfig.spec.json`, `src/public-api.ts`.
2. `tsconfig.json` raiz: `paths["@opendlq/core"]` e as `references` (lib + spec).
3. `angular.json`: projeto `core` (library, `build` e `test`), igual ao de `modules`.
4. `package.json` raiz: acrescentar `ng build core` antes de `modules` em `build`, e `ng test core --watch=false` em `test`.
5. `modules/package.json` e `apps/console/package.json`: dependência `"@opendlq/core": "workspace:*"`.
6. Conteúdo: services `@Injectable({ providedIn: 'root' })`, `inject()` (não construtor), `HttpClient`/`httpResource`, config por `InjectionToken`, DTOs tipados. Nada de estado de tela (isso é da store).
7. Migrar: a store troca `signal(FIXTURE)` por `inject(Service)`; a fixture vira dado de spec/story.

## Dívida conhecida (não replicar)

- `packages/ui/src/lib/mocks.ts` é exportado pelo `public-api.ts` e `topic-messages.store.ts` importa `DLQ_MESSAGES` dele. Destino: mocks de ui só para stories (`__fixtures__`, fora do `public-api`); a store do módulo usa a própria fixture.
- `packages/modules/src/topics/topics.data.ts` mistura tipo (`DlqTopic`) e dado (`DLQ_TOPICS`) e é exportado no `public-api.ts`. Destino: tipo no store/`topics.types.ts`, dado em `topics/__fixtures__/topics.fixture.ts`.

Ao tocar nesses arquivos, migre; ao criar novos, siga a regra.
