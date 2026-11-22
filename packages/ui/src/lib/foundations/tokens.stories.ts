import type { Meta, StoryObj } from '@storybook/angular';

const groups: Record<string, string[]> = {
  Superfícies: ['bg', 'surface', 'surface-muted', 'surface-hover', 'surface-sunken', 'border', 'border-strong'],
  Texto: ['text', 'text-muted', 'text-subtle'],
  Marca: ['primary', 'primary-hover', 'primary-soft', 'primary-soft-fg', 'link'],
  Estados: ['success', 'success-soft', 'danger', 'danger-soft', 'warning', 'warning-soft', 'info', 'info-soft'],
  Código: ['code-bg', 'code-text', 'code-key', 'code-string', 'code-number', 'code-bool', 'code-punct', 'diff-add', 'diff-del'],
  Gráficos: ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5', 'chart-6', 'chart-7', 'chart-8'],
};

const meta: Meta = { title: 'Fundação/Tokens', tags: ['autodocs'], parameters: { layout: 'padded' } };
export default meta;

export const Cores: StoryObj = {
  render: () => ({
    props: { groups: Object.entries(groups) },
    template: `
      @for (g of groups; track g[0]) {
        <h3 style="margin:20px 0 8px;font-size:13px">{{ g[0] }}</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px">
          @for (t of g[1]; track t) {
            <div style="border:1px solid var(--ui-border);border-radius:8px;overflow:hidden">
              <div [style.background]="'var(--ui-' + t + ')'" style="height:44px"></div>
              <div style="padding:6px 8px;font:11px var(--ui-font-mono);color:var(--ui-text-muted)">--ui-{{ t }}</div>
            </div>
          }
        </div>
      }`,
  }),
};

export const Tipografia: StoryObj = {
  render: () => ({
    template: `
      <div style="display:grid;gap:10px">
        <div style="font-size:28px;font-weight:700">Dead Letter Queue — 28/700</div>
        <div style="font-size:20px;font-weight:600">Reprocess message — 20/600</div>
        <div style="font-size:14px">Corpo grande 14 — Message reprocessing lets you send a message again.</div>
        <div style="font-size:13px">Corpo padrão 13 — The filter code is a JavaScript function body.</div>
        <div style="font-size:12px;color:var(--ui-text-muted)">Secundário 12 — Show from: Latest</div>
        <div style="font:10px var(--ui-font-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--ui-text-subtle)">LABEL MONO 10 — REPLICATION FACTOR</div>
        <code style="font-size:12px">{{ '{' }} "source_account": "DE70700500000005193886" {{ '}' }} — mono 12</code>
      </div>`,
  }),
};

export const RaiosESombras: StoryObj = {
  render: () => ({
    template: `
      <div style="display:flex;gap:16px;flex-wrap:wrap">
        @for (r of ['sm','md','lg','xl']; track r) {
          <div [style.border-radius]="'var(--ui-radius-' + r + ')'" style="width:96px;height:64px;border:1px solid var(--ui-border-strong);display:grid;place-items:center;font:11px var(--ui-font-mono)">{{ r }}</div>
        }
        @for (s of ['sm','md','lg']; track s) {
          <div [style.box-shadow]="'var(--ui-shadow-' + s + ')'" style="width:96px;height:64px;border-radius:8px;background:var(--ui-surface);display:grid;place-items:center;font:11px var(--ui-font-mono)">shadow-{{ s }}</div>
        }
      </div>`,
  }),
};
