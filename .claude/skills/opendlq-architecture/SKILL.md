---
name: opendlq-architecture
description: Arquitetura do workspace OpenDLQ (apps/console, packages/ui, packages/modules, packages/core). Use ao decidir ONDE um código deve ficar, ao criar/mover arquivos entre packages, ao revisar imports entre packages, ao lidar com dados de exemplo (__fixtures__), com o modo fixtures/http ou ao criar o packages/core. Para páginas use opendlq-page, features opendlq-module, componentes opendlq-ui-component, testes Playwright opendlq-e2e.
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
| Teste Playwright (um por request) | `apps/console/e2e/` | `opendlq-e2e` |
| Dados de exemplo | `__fixtures__/` ao lado de quem usa | esta skill |

Regra de bolso: se dá para testar sem DOM, vai para o módulo; se depende de `Router`, `document` ou toast, fica na página; se só desenha, vai para `ui`.

## Dados: fixtures ↔ request real

O alvo é **alternar** entre fixture e request real sem mudar service, store, página nem teste. Duas fases:

**Fase 1 (hoje, sem `core`)**: a store lê a fixture do próprio módulo (ver `opendlq-module`).

**Fase 2 (com `core`)**: toda request passa por `HttpClient`/`httpResource` num service do `core`. O **modo** só decide quem responde:

| Modo | Quem responde | Para quê |
|---|---|---|
| `fixtures` | interceptor do `core` devolve a fixture (`'GET /topics'` → corpo) | dev sem backend, Playwright determinístico |
| `http` | rede real (`OPENDLQ_API_URL`) | dev contra o backend, Playwright de integração |

- O modo vem de **configuração de build** do console (`fixtures` e `http` em `angular.json`, via `define` ou `fileReplacements`) e chega por `provideOpendlqCore({ mode })`. Interceptor e fixtures só entram no bundle do modo `fixtures`: nenhum mock em produção.
- Um único service por recurso e uma única forma de chamar. Nenhuma camada acima do `core` conhece o modo.
- Rotas de fixture: **um único** `packages/core/src/fixtures.ts` importa os `.json` e mapeia `'METHOD /path'` → JSON (`{ 'GET /topics': topics }`). Sem handler por recurso e sem lógica.
- **Toda request nasce com fixture JSON, entrada nessa tabela e teste Playwright** (ver `opendlq-e2e`).

### Regras das fixtures (valem nas duas fases)

- **Dados ficam sempre em `.json`**, em `__fixtures__/` ao lado de quem consome: `packages/modules/src/<modulo>/__fixtures__/<nome>.json` (fase 1), `packages/core/src/<recurso>/__fixtures__/` (fase 2) e `packages/ui/src/lib/<nome>/__fixtures__/` (só stories). O nome diz o que tem (`failure-messages.json`, não `data.json`).
- **Nenhum `.ts` dentro de `__fixtures__/`.** Sem gerador, sem `Math.random()`, sem sorteio com semente (`lcg`), sem helper de data (`ts(minAgo)`), sem `Date.now()`. Valor calculado vira valor escrito: data absoluta (`"2026-11-22 11:13:00"`; "agora" = 2026-11-22 12:00 UTC), id e payload literais.
- JSON pequeno o bastante para **ler**: dezenas de registros por arquivo, não centenas. Mais variedade = outro arquivo.
- Fixture guarda **só dado**. Derivado (grupos, funil, histórico) é calculado por função em `domain.ts`/store a partir do JSON.
- O tipo vem do consumidor, num único ponto, com cast (compila com o `tsconfig` atual, sem `resolveJsonModule`):
  ```ts
  import topics from './__fixtures__/topics.json';

  // ponytail: fixture; troque por inject(<Recurso>Service) do @opendlq/core quando existir.
  readonly topics = signal(topics as DlqTopic[]);
  ```
- **Nunca** exporte fixture no `public-api.ts`; um package **não** importa fixture de outro.

## Quando criar `packages/core`

Só quando a primeira store precisar de dado real. Espelhe `packages/modules`:

1. `packages/core/` com `package.json` (`@opendlq/core`, `exports: { ".": "./src/public-api.ts" }`, peer `@angular/core`), `tsconfig.lib.json`, `tsconfig.spec.json`, `src/public-api.ts`.
2. `tsconfig.json` raiz: `paths["@opendlq/core"]` e as `references` (lib + spec).
3. `angular.json`: projeto `core` (library, `build` e `test`), igual ao de `modules`.
4. `package.json` raiz: acrescentar `ng build core` antes de `modules` em `build`, e `ng test core --watch=false` em `test`.
5. `modules/package.json` e `apps/console/package.json`: dependência `"@opendlq/core": "workspace:*"`.
6. Conteúdo: services `@Injectable({ providedIn: 'root' })`, `inject()` (não construtor), `HttpClient`/`httpResource`, config por `InjectionToken`, DTOs tipados. Nada de estado de tela (isso é da store).
7. Modo: `provideOpendlqCore({ mode })` registra o interceptor de fixtures **só** em `mode: 'fixtures'`; os JSON da fase 1 migram para `core/src/<recurso>/__fixtures__/` e entram na tabela `core/src/fixtures.ts`.
8. Configurações de build `fixtures` e `http` no console e scripts `dev:fixtures` / `dev:http` no `package.json` raiz.
9. Migrar a store: troca `signal(FIXTURE)` por `inject(Service)` e ganha `loading`/`error`. Playwright segue `opendlq-e2e`.
