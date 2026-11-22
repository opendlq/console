import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { OdlqIcon } from '../icon/icon';
import { OdlqButton } from './button';
import { OdlqIconButton } from './icon-button';

const meta: Meta<OdlqButton> = {
  title: 'Primitivos/Button',
  component: OdlqButton,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [OdlqButton, OdlqIconButton, OdlqIcon] })],
  args: { variant: 'primary', size: 'md', loading: false },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'outline', 'ghost', 'danger', 'danger-soft'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  render: (args) => ({
    props: args,
    template: `<button odlq-button [variant]="variant" [size]="size" [loading]="loading">Reprocess message</button>`,
  }),
};
export default meta;
type Story = StoryObj<OdlqButton>;

export const Primary: Story = {};

export const Variantes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
        <button odlq-button variant="primary">Apply filter</button>
        <button odlq-button variant="secondary">Clear all</button>
        <button odlq-button variant="outline">Add JS filter</button>
        <button odlq-button variant="ghost">Cancel</button>
        <button odlq-button variant="danger">Delete topic</button>
        <button odlq-button variant="danger-soft">Discard</button>
        <button odlq-button variant="primary" disabled>Disabled</button>
        <button odlq-button variant="primary" [loading]="true">Publishing</button>
      </div>`,
  }),
};

export const ComIcone: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
        <button odlq-button variant="outline"><odlq-icon name="plus" [size]="14" /> Add JS filter</button>
        <button odlq-button variant="primary"><odlq-icon name="filter" [size]="14" /> More filters</button>
        <button odlq-button variant="outline"><odlq-icon name="save" [size]="14" /> Save</button>
        <button odlq-button variant="primary">Edit and publish <odlq-icon name="external-link" [size]="14" /></button>
      </div>`,
  }),
};

export const Tamanhos: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:12px;align-items:center">
        <button odlq-button variant="primary" size="sm">Small</button>
        <button odlq-button variant="primary" size="md">Medium</button>
        <button odlq-button variant="primary" size="lg">Large</button>
      </div>`,
  }),
};

export const SoIcone: Story = {
  name: 'Icon button',
  render: () => ({
    template: `
      <div style="display:flex;gap:12px;align-items:center">
        <button odlq-icon-button icon="refresh" label="Refresh" variant="outline"></button>
        <button odlq-icon-button icon="more" label="More actions"></button>
        <button odlq-icon-button icon="plus" label="Create" variant="primary" round></button>
        <button odlq-icon-button icon="trash" label="Delete" variant="danger-soft"></button>
        <button odlq-icon-button icon="close" label="Close" variant="secondary" round></button>
      </div>`,
  }),
};
