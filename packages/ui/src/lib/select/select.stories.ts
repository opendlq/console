import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import type { OdlqOption } from '../types';
import { OdlqSelect } from './select';

const showFrom: OdlqOption[] = [
  { value: 'latest', label: 'Latest' },
  { value: 'beginning', label: 'Beginning' },
  { value: 'timestamp', label: 'Timestamp' },
  { value: 'offset', label: 'Offset' },
];

const meta: Meta<OdlqSelect> = {
  title: 'Primitivos/Select',
  component: OdlqSelect,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [OdlqSelect] })],
  args: { options: showFrom, value: 'latest', prefix: 'Show from:', placeholder: 'Select…', size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
  parameters: { docs: { story: { inline: false, iframeHeight: 260 } } },
  render: (args) => ({
    props: args,
    template: `<odlq-select [options]="options" [(value)]="value" [prefix]="prefix" [placeholder]="placeholder" [size]="size" label="Show from" style="min-width:200px" />`,
  }),
};
export default meta;
type Story = StoryObj<OdlqSelect>;

export const ShowFrom: Story = {};

export const SemPrefixo: Story = {
  args: {
    prefix: '',
    value: 'super-awesome-topic-name',
    options: [
      { value: 'super-awesome-topic-name', label: 'super-awesome-topic-name' },
      { value: 'orders.dlq', label: 'orders.dlq' },
      { value: 'payments.dlq', label: 'payments.dlq' },
    ],
  },
};

export const Placeholder: Story = { args: { value: null, prefix: '' } };
