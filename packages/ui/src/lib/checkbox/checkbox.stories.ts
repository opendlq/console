import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import type { OdlqOption } from '../types';
import { OdlqRadioGroup } from '../radio/radio-group';
import { OdlqSegmentedControl } from '../segmented-control/segmented-control';
import { OdlqToggle } from '../toggle/toggle';
import { OdlqCheckbox } from './checkbox';

const meta: Meta<OdlqCheckbox> = {
  title: 'Primitivos/Seleção (checkbox, toggle, radio, segmented)',
  component: OdlqCheckbox,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [OdlqCheckbox, OdlqToggle, OdlqRadioGroup, OdlqSegmentedControl] })],
  args: { value: true, indeterminate: false, disabled: false },
  render: (args) => ({
    props: args,
    template: `<odlq-checkbox [(value)]="value" [indeterminate]="indeterminate" [disabled]="disabled">Can manage Cluster configurations</odlq-checkbox>`,
  }),
};
export default meta;
type Story = StoryObj<OdlqCheckbox>;

export const Checkbox: Story = {};

export const Estados: Story = {
  render: () => ({
    template: `
      <div style="display:grid;gap:10px">
        <odlq-checkbox [value]="false">Unchecked</odlq-checkbox>
        <odlq-checkbox [value]="true">Checked</odlq-checkbox>
        <odlq-checkbox [indeterminate]="true">Indeterminate</odlq-checkbox>
        <odlq-checkbox [value]="true" disabled>Disabled</odlq-checkbox>
      </div>`,
  }),
};

export const Toggle: Story = {
  render: () => ({
    template: `<div style="display:grid;gap:10px"><odlq-toggle>Show overrides only</odlq-toggle><odlq-toggle [value]="true">Graphs</odlq-toggle><odlq-toggle disabled>Disabled</odlq-toggle></div>`,
  }),
};

const keyFormats: OdlqOption[] = [
  { value: 'string', label: 'String' },
  { value: 'json', label: 'JSON' },
  { value: 'avro', label: 'Avro', description: 'Requires Schema Registry' },
];

export const Radio: Story = {
  render: () => ({
    props: { keyFormats, v: 'string' },
    template: `<odlq-radio-group [options]="keyFormats" [(value)]="v" label="Key format" />`,
  }),
};

export const Segmented: Story = {
  render: () => ({
    props: {
      ranges: ['1H', '1D', '7D', '30D'].map((r) => ({ value: r, label: r })),
      tabs: ['Data', 'Headers', 'Metadata'].map((r) => ({ value: r, label: r })),
      r: '1D',
      t: 'Data',
    },
    template: `
      <div style="display:grid;gap:16px;justify-items:start">
        <odlq-segmented-control [options]="ranges" [(value)]="r" label="Range" />
        <odlq-segmented-control [options]="tabs" [(value)]="t" label="Section" />
      </div>`,
  }),
};
