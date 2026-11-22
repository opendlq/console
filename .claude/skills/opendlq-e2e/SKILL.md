---
name: opendlq-e2e
description: Testes Playwright do console OpenDLQ. Use ao criar ou alterar uma request (service do core), endpoint, fixture handler ou fluxo de página que dispara request, e ao escrever/rodar teste e2e. Toda request tem teste Playwright e o mesmo teste roda nos modos fixtures e http.
---

# Playwright no OpenDLQ

**Regra:** uma request só está pronta com (1) fixture handler no `core` e (2) um teste Playwright. O mesmo arquivo de teste roda nos dois modos (`fixtures` e `http`); modos em `opendlq-architecture`.

> Estado atual: não há `packages/core`, request nem `@playwright/test` instalado. Enquanto isso, e2e de fluxo (só com fixtures) é opcional. A regra acima vale a partir da primeira request.

## Onde e como nomear

```
apps/console/e2e/<recurso>.e2e.ts     # um arquivo por recurso do core
playwright.config.ts                  # raiz
```

- Sufixo `.e2e.ts` (com `testMatch: '**/*.e2e.ts'`) para não colidir com os `*.spec.ts` do vitest (`ng test`).
- **Título do teste = a request**: `test('GET /topics', ...)`, `test('POST /messages/reprocess', ...)`. Assim dá para conferir a cobertura comparando as chaves dos handlers com os títulos.

## Dois projetos, os mesmos testes

```ts
// playwright.config.ts (esqueleto)
export default defineConfig({
  testDir: 'apps/console/e2e',
  testMatch: '**/*.e2e.ts',
  projects: [
    { name: 'fixtures', use: { baseURL: 'http://localhost:4200', mode: 'fixtures' } },
    // só roda com backend real configurado
    ...(process.env['OPENDLQ_API_URL'] ? [{ name: 'http', use: { baseURL: 'http://localhost:4201', mode: 'http' } }] : []),
  ],
  webServer: [
    { command: 'pnpm dev:fixtures', port: 4200, reuseExistingServer: true },
    ...(process.env['OPENDLQ_API_URL'] ? [{ command: 'pnpm dev:http --port 4201', port: 4201, reuseExistingServer: true }] : []),
  ],
});
```

`mode` é uma option do projeto declarada via `test.extend` para os testes lerem (`test.skip(mode === 'http', ...)`).

## Escrever o teste

- Abra a rota, dispare a ação que gera a request e **espere pela UI**: `await expect(page.getByRole('row')).not.toHaveCount(0)`. No modo `fixtures` a resposta nasce no interceptor dentro do app, então não existe tráfego de rede para `waitForResponse`.
- Para provar a request no modo `http`, use `page.waitForResponse` só dentro de `if (mode === 'http')`.
- **Asserte comportamento e estrutura, não valores da fixture** (há linhas, o filtro reduz a lista, o toast aparece). Valor exato só com `test.skip(mode === 'http', 'valor da fixture')`, porque o backend real tem outros dados.
- Seletores por `getByRole`/`getByLabel`; `data-testid` só quando não houver papel acessível.
- Mutação (reprocessar, descartar): confira o efeito visível (contador, linha some), não o corpo da resposta.
- Caminho feliz por request é o mínimo. Erro e lista vazia: `page.route()` forçando a resposta no projeto `http`; no `fixtures` fica como limite conhecido (handlers só devolvem o caso feliz).

## Primeira vez (setup)

```bash
pnpm add -D -w @playwright/test
pnpm exec playwright install chromium
```

Scripts no `package.json` raiz: `"dev:fixtures"`, `"dev:http"` (configurações de build do console, ver `opendlq-architecture`) e `"e2e": "playwright test"`.

## Conferir

```bash
pnpm e2e                                   # projeto fixtures
OPENDLQ_API_URL=http://localhost:8080 pnpm e2e   # fixtures + http
```
