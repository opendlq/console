import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta = {
  title: 'Fundação/Logo',
  tags: ['autodocs'],
  parameters: { layout: 'padded', docs: { description: { component: 'Marca do OpenDLQ: envelope (mensagem) + selo com seta de retorno (reprocessar). Arquivos em `packages/ui/assets/`.' } } },
};
export default meta;

export const Marca: StoryObj = {
  render: () => ({
    template: `
      <div style="display:flex;align-items:flex-end;gap:24px;flex-wrap:wrap">
        <img src="opendlq-mark.svg" width="128" height="128" alt="OpenDLQ" />
        <img src="opendlq-mark.svg" width="64" height="64" alt="OpenDLQ" />
        <img src="opendlq-mark.svg" width="32" height="32" alt="OpenDLQ" />
        <img src="opendlq-mark.svg" width="16" height="16" alt="OpenDLQ" />
      </div>`,
  }),
};

export const Horizontal: StoryObj = {
  render: () => ({
    template: `
      <div style="display:grid;gap:24px">
        <img src="opendlq-logo.svg" height="64" alt="OpenDLQ" />
        <img src="opendlq-logo.svg" height="40" alt="OpenDLQ" />
        <img src="opendlq-logo.svg" height="24" alt="OpenDLQ" />
      </div>`,
  }),
};
