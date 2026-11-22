---
name: opendlq-ui-component
description: Cria ou altera um componente do design system em packages/ui, com story no Storybook. Use ao adicionar/editar componente visual (botão, tabela, drawer, badge, card...), *.stories.ts, tokens de tema (--ui-*), ou ao exportar algo no public-api de @opendlq/ui. Componente de ui nunca busca dados nem conhece stores.
---

# Componente do `@opendlq/ui`

Componente é **só apresentação**: recebe por `input()`, emite por `output()`/`model()`. Sem `HttpClient`, `Router`, store ou import de `@opendlq/modules`/`core`. Camadas: `opendlq-architecture`.

## Estrutura

```
packages/ui/src/lib/<nome>/
├─ <nome>.ts             # componente (template e estilos INLINE, diferente das páginas)
├─ <nome>.stories.ts     # story obrigatória
└─ __fixtures__/*.json   # só se a story precisar de dados: JSON, nenhum .ts, fora do public-api
```

Exemplo de referência: `button/button.ts` + `button/button.stories.ts`.

## Componente

- Sem sufixo `.component`. Classe `Odlq<Nome>`, seletor `odlq-<nome>`. Wrapper de elemento nativo usa seletor de atributo: `button[odlq-button]`.
- `changeDetection: ChangeDetectionStrategy.OnPush`.
- `input()` / `input.required<T>()`, `output()`, `model()`; boolean com `{ transform: booleanAttribute }`.
- Variante e tamanho viram atributo no host (`host: { '[attr.data-variant]': 'variant()' }`) e o CSS usa `:host([data-variant='primary'])`. Use `host: {}`, não `@HostBinding`.
- `template:` e `styles:` inline são **permitidos em `ui`** (as páginas é que não podem).
- Estilo só com tokens `--ui-*` (`var(--ui-primary)`, `--ui-radius-md`, `--ui-text-md`, `--ui-focus-ring`). Sem cor, raio ou fonte fixos.
- Foco visível com `:host(:focus-visible)` + `--ui-focus-ring`; estado desabilitado/`aria-disabled`; `aria-*` e rótulo em controles.
- Ícone via `<odlq-icon name="..." [size]="14" />` (não importe lucide direto no componente).
- Comentário `/** ... */` em português na classe, dizendo como usar.
- Tipos compartilhados (`OdlqSize`, `OdlqTone`) vêm de `../types`.
- Controle de formulário reaproveita `lib/form/control`.

## Story (obrigatória)

```ts
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { OdlqButton } from './button';

const meta: Meta<OdlqButton> = {
  title: 'Primitivos/Button',          // '<Seção>/<Nome>', mesmas seções do public-api
  component: OdlqButton,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [OdlqButton] })],
  args: { variant: 'primary', size: 'md' },
  argTypes: { variant: { control: 'select', options: [...] } },
  render: (args) => ({ props: args, template: `<button odlq-button [variant]="variant">Reprocess</button>` }),
};
export default meta;
export const Primary: StoryObj<OdlqButton> = {};
```

- Uma story para o caso padrão e outra para as variações/estados (`Variantes`, `ComIcone`, desabilitado, carregando, vazio).
- Dados da story saem de `__fixtures__/*.json` (`import msgs from './__fixtures__/x.json'` + cast `as DlqMessage[]`), nunca de `Math.random()` nem de gerador em TS.
- O addon a11y está ligado: resolva os avisos do painel.

## Export

Acrescente o componente em `packages/ui/src/public-api.ts`, **na seção certa** (Fundação, Primitivos, Navegação/layout, DLQ...). Não exporte stories nem fixtures.

## Teste

`ui` quase não tem spec (3 arquivos). Só escreva `*.spec.ts` se o componente tiver **lógica** (cálculo, parsing, teclado). Visual vai na story.

## Conferir

```bash
pnpm storybook                 # confira a story e o painel de a11y
pnpm exec ng test ui --watch=false
pnpm build
```
