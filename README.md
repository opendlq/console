# OpenDLQ

<img src="packages/ui/assets/opendlq-logo.svg" alt="OpenDLQ" height="48" />

Monorepo **pnpm** com **Angular 22** e **Storybook 10** para o console do **OpenDLQ**, o plano de controle de Dead Letter Queues: classifica falhas (transitórias × permanentes), recupera sozinho o que dá, agrupa por causa raiz, aplica runbooks e audita tudo. Paleta verde-escuro com verde-limão, em claro e escuro.

```
apps/console      app Angular (shell + rotas lazy); cada página = .ts + .html + .css
packages/ui       @opendlq/ui — design system (componentes, tokens, domínio) + Storybook
packages/modules  @opendlq/modules — lógica e estado dos módulos (stores) + testes
```

## Começando

Requer Node `^22.22.3` (ou `>=24.15`) e pnpm 11.

```bash
pnpm install
pnpm storybook        # http://localhost:6006 — toda a UI, com seletor de tema
pnpm dev              # http://localhost:4200 — app console
pnpm build            # ui + modules + console
pnpm build-storybook  # storybook estático em dist/storybook
pnpm test             # vitest (ui + modules + console)
pnpm typecheck        # stories e componentes
```

## Storybook

| Seção | Conteúdo |
|---|---|
| Introdução | visão geral e convenções |
| Fundação | tokens (`--ui-*`), ícones, logo (`packages/ui/assets/*.svg`) |
| Primitivos | Button, Input, Select, Checkbox, Toggle, Radio, Segmented, Badge, Chip, Kbd, Tooltip, Avatar, Alert, FormField |
| Navegação | AppShell, Sidebar, Topbar, PageHeader, Tabs, Pagination, CommandPalette |
| Dados | KPI, DataTable, KeyValueTable, EmptyState, Card, Accordion, Progress, CodeBlock/Editor, DiffViewer |
| Overlays | Drawer, Modal, ConfirmDialog, Menu, Toast |
| Gráficos | BarChart (simples/empilhado), LineChart, Legend |
| DLQ | StateBadge, KindBadge, StateStrip, Funnel, FilterBar, GroupTable, MessageTable, BulkActionBar, MessageDetailDrawer, ReplayDrawer, ReclassifyDialog, LogExtract, AttemptTimeline, HeaderList, BreakerCard, RunbookCard, RiskCard, AuditLog, Sparkline |
| Páginas | Overview, Failures, Failure (uma causa), Recovery, Runbooks, Insights, Alerts, Audit log, Configuration |

## Usando a lib

```ts
import { OdlqButton, OdlqMessageTable } from '@opendlq/ui';
```

Estilos globais (já configurados em `angular.json`): fontes `@fontsource-variable`, `@angular/cdk/overlay-prebuilt.css` e `packages/ui/src/styles/index.css`. O tema fica em `<html data-theme="light|dark">` (`OdlqThemeService`).

## Páginas

Rotas do app: `/overview`, `/failures`, `/failures/:key`, `/recovery`, `/runbooks`, `/audit`. Insights, Alerts e Configuration existem como stories de tela (ainda sem rota).

Páginas só compõem UI: `apps/console/src/app/pages/<nome>/<nome>.{ts,html,css}`, sem template/estilo inline e **sem teste**. Estado, regras e testes ficam em `packages/modules`. A convenção está na skill `.claude/skills/opendlq-page`.

## Dados de exemplo

Fixtures são **JSON escrito à mão** em `__fixtures__/` ao lado de quem usa (módulos e stories), sem gerador e sem `.ts`; agrupamentos, funil e histórico são derivados por funções de `domain.ts`. "Agora" nas fixtures é 2026-11-22 12:00 UTC. Regras em `.claude/skills/opendlq-architecture`.

## Decisões

- CSS puro + _design tokens_; sem Tailwind/Material. CDK para overlay, foco e menu.
- Componentes standalone, zoneless, `OnPush`, signals (`input`/`output`/`model`).
- TypeScript fixado em `~6.0` (Angular 22 não suporta 7.x).
- Gráficos, highlight de código e diff são código próprio. Os tetos estão marcados com `// ponytail:` (editor por `textarea` → CodeMirror 6; diff O(n·m); gráficos → ECharts se precisar de zoom/brush).
