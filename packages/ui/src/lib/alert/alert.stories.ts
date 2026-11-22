import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { OdlqButton } from '../button/button';
import { OdlqIcon } from '../icon/icon';
import { OdlqInput } from '../input/input';
import { OdlqTooltip } from '../tooltip/tooltip';
import { OdlqFormField } from '../form-field/form-field';
import { OdlqAlert } from './alert';

const meta: Meta<OdlqAlert> = {
  title: 'Primitivos/Alert, Form field e Tooltip',
  component: OdlqAlert,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [OdlqAlert, OdlqFormField, OdlqInput, OdlqTooltip, OdlqButton, OdlqIcon] })],
  args: { tone: 'danger', heading: 'Attention:', closable: false },
  argTypes: { tone: { control: 'select', options: ['danger', 'warning', 'info', 'success'] } },
  render: (args) => ({
    props: args,
    template: `<odlq-alert [tone]="tone" [heading]="heading" [closable]="closable">Your connector configuration is invalid. Check the error below.</odlq-alert>`,
  }),
};
export default meta;
type Story = StoryObj<OdlqAlert>;

export const Alert: Story = {};

export const Tons: Story = {
  render: () => ({
    template: `
      <div style="display:grid;gap:10px;max-width:560px">
        <odlq-alert tone="danger" heading="Attention:">Your connector configuration is invalid.</odlq-alert>
        <odlq-alert tone="warning" heading="Retry budget low:">3 messages will be parked after the next failure.</odlq-alert>
        <odlq-alert tone="info" [closable]="true">Messages are reprocessed to the same or a new topic.</odlq-alert>
        <odlq-alert tone="success">42 messages reprocessed successfully.</odlq-alert>
      </div>`,
  }),
};

export const FormField: Story = {
  render: () => ({
    template: `
      <div style="display:grid;gap:16px;max-width:380px">
        <odlq-form-field label="Filter name" info="This name will be shown in your filter tag" hint="Optional">
          <odlq-input placeholder="This name will be shown in your filter tag" label="Filter name" />
        </odlq-form-field>
        <odlq-form-field label="Topic" [required]="true" error="Topic name is required">
          <odlq-input [invalid]="true" placeholder="orders.dlq" label="Topic" />
        </odlq-form-field>
      </div>`,
  }),
};

export const Tooltip: Story = {
  parameters: { docs: { story: { inline: false, iframeHeight: 160 } } },
  render: () => ({
    template: `
      <div style="display:flex;gap:16px;padding:48px 16px">
        <button odlq-button variant="outline" odlqTooltip="Copy message to clipboard"><odlq-icon name="copy" [size]="14" /> Copy all</button>
        <button odlq-button variant="outline" odlqTooltip="Opens below" odlqTooltipSide="bottom">Bottom</button>
      </div>`,
  }),
};
