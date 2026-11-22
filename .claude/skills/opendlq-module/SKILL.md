---
name: opendlq-module
description: Cria ou altera uma feature (módulo) em packages/modules: store com signals, regras, fixtures e testes. Use ao adicionar estado, filtros, ações ou dados de uma tela, ao criar/editar *.store.ts, ao escrever teste de lógica, ou ao ligar uma store a dados (fixture hoje, packages/core depois). A página que consome a store segue opendlq-page.
---

# Módulo (feature) do OpenDLQ

Um módulo é **estado e regra de uma feature**, sem DOM e sem `Router`. Camadas e dependências: `opendlq-architecture`.

## Estrutura (uma pasta por módulo)

```
packages/modules/src/<modulo>/
├─ <modulo>.store.ts          # @Injectable com signals
├─ <modulo>.store.spec.ts     # vitest, sem TestBed
├─ <modulo>.types.ts          # só se mais de um arquivo usa o tipo
└─ __fixtures__/
   └─ <modulo>.fixture.ts     # dados de exemplo, determinísticos
```

Exemplo real: `topics/` (`topics.store.ts` + spec) e `topic-messages.store.ts`.

## Store

- `@Injectable`, estado em `signal`, derivados em `computed`, mutação com `update`/`set` (imutável: `[...l, x]`, `{ ...m, status }`).
- Métodos **puros em relação à tela**: devolvem o resultado (`reprocessSelected(): number`) e a página decide o toast. Sem `Router`, `document`, toast, `window`.
- Escopo:
  - estado **por tela** (seleção, filtros, item ativo): `@Injectable()` sem `providedIn`; a página declara `providers: [Store]`. Ex.: `TopicMessagesStore`.
  - estado **global** (lista compartilhada): `@Injectable({ providedIn: 'root' })`. Ex.: `TopicsStore`.
- Dependências por `inject()`, nunca por construtor.
- De `@opendlq/ui` importe **só tipos e funções puras de `domain.ts`** (`import type { DlqStatus } from '@opendlq/ui'`). Nunca componente nem mock.
- Funções de regra que não precisam de estado (`topicHealth`) ficam **exportadas fora da classe**, para testar sem instanciar.
- Comentário `/** ... */` em português na classe e nos métodos públicos; limites e constantes nomeados (`PARKED_ALERT_THRESHOLD`).

## Dados: fixture hoje, core depois

Estado inicial lê a fixture do próprio módulo, com a emenda marcada:

```ts
import { TOPICS_FIXTURE } from './__fixtures__/topics.fixture';

// ponytail: fixture; troque por inject(TopicsService) do @opendlq/core quando existir.
readonly topics = signal<DlqTopic[]>(TOPICS_FIXTURE);
```

- Fixture: `export const TOPICS_FIXTURE: DlqTopic[] = [...]`, `UPPER_SNAKE`, sem `Math.random()`/`Date.now()`, só dados.
- Fixture **não** entra no `public-api.ts` e não é importada por outro package.
- Quando o `core` existir, a store passa a receber os dados do service e a fixture fica para spec/story.

## Passo a passo

1. Pasta `packages/modules/src/<modulo>/` com store, fixture e spec.
2. Exporte no `packages/modules/src/public-api.ts` **a store e os tipos** (nunca a fixture):
   ```ts
   export * from './topics/topics.store';
   ```
3. Escreva o spec junto (abaixo) e rode os testes.
4. Só então crie/ajuste a página (`opendlq-page`).

## Teste (`<modulo>.store.spec.ts`)

- `vitest` com globals (`describe`/`it`/`expect` sem import). `new Store()` basta, sem `TestBed`.
- `describe` e `it` em português, uma frase por comportamento.
- Monte o caso com uma fábrica pequena no próprio spec (`const topic = (over: Partial<DlqTopic>) => ({ ..., ...over })`); use a fixture só para provar a ligação (ex.: `rows()` tem o mesmo tamanho de `topics()`).
- Cubra **ramos e bordas** (busca vazia, caixa, espaços, limite exato, item inexistente), não getters triviais.
- Nada de snapshot, nada de DOM.

## Conferir

```bash
pnpm exec ng test modules --watch=false
pnpm build
```
