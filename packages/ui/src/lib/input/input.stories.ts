import { FormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { OdlqKbd } from '../kbd/kbd';
import { OdlqInput } from './input';
import { OdlqTextarea } from './textarea';

const meta: Meta<OdlqInput> = {
  title: 'Primitivos/Input',
  component: OdlqInput,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [OdlqInput, OdlqTextarea, OdlqKbd, FormsModule] })],
  args: { placeholder: 'Quick search by key, value…', icon: 'search', size: 'md', invalid: false },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  render: (args) => ({
    props: args,
    template: `<div style="max-width:340px"><odlq-input [placeholder]="placeholder" [icon]="icon" [size]="size" [invalid]="invalid" label="Search" /></div>`,
  }),
};
export default meta;
type Story = StoryObj<OdlqInput>;

export const Busca: Story = {};

export const ComAtalho: Story = {
  render: () => ({
    template: `<div style="max-width:340px"><odlq-input icon="search" placeholder="Search…" label="Search"><kbd odlq-kbd>⌘ + K</kbd></odlq-input></div>`,
  }),
};

export const ComNgModel: Story = {
  render: () => ({
    props: { name: 'city-2' },
    template: `
      <div style="max-width:340px;display:grid;gap:8px">
        <odlq-input [(ngModel)]="name" placeholder="This name will be shown in your filter tag" label="Filter name" />
        <code style="font-size:12px">valor: {{ name }}</code>
      </div>`,
  }),
};

export const Invalido: Story = { args: { invalid: true, icon: null, placeholder: 'topic-name' } };

export const Textarea: Story = {
  render: () => ({
    template: `
      <div style="max-width:420px">
        <odlq-textarea [rows]="5" [mono]="true" label="Filter code"
          placeholder="// record.value.Address.City.startsWith(&quot;Pa&quot;) # Matches Paris, Palermo, Pasadena" />
      </div>`,
  }),
};
