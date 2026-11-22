import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import resources from '../dlq/__fixtures__/config-resources.json';
import messages from '../dlq/__fixtures__/failure-messages.json';
import { prettyPayload, type ConfigResource, type DlqMessage } from '../domain';
import { OdlqCodeBlock } from './code-block';
import { OdlqCodeEditor } from './code-editor';
import { OdlqDiffViewer } from './diff-viewer';

const RESOURCES = resources as ConfigResource[];
const JSON_PAYLOAD = prettyPayload((messages as DlqMessage[]).find((m) => m.payload.startsWith('{'))!.payload);

const BEFORE = '{\n  "currency": "EUR",\n  "amount": "1 014 551",\n  "transaction_date": "21/06/2022"\n}';
const AFTER = '{\n  "currency": "EUR",\n  "amount": 1014551,\n  "transaction_date": "2022-06-21"\n}';

const meta: Meta<OdlqCodeBlock> = {
  title: 'Dados/Código (block, editor, diff)',
  component: OdlqCodeBlock,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [OdlqCodeBlock, OdlqCodeEditor, OdlqDiffViewer] })],
  args: { code: JSON_PAYLOAD, language: 'json', lineNumbers: true, copyable: true },
  argTypes: { language: { control: 'inline-radio', options: ['json', 'properties', 'js', 'text'] } },
  render: (args) => ({
    props: args,
    template: `<odlq-code-block [code]="code" [language]="language" [lineNumbers]="lineNumbers" [copyable]="copyable" style="max-width:560px" />`,
  }),
};
export default meta;
type Story = StoryObj<OdlqCodeBlock>;

export const Json: Story = {};

export const Properties: Story = {
  name: 'Recurso YAML (Policy)',
  args: { code: RESOURCES[1].yaml, language: 'properties' },
};

export const Runbook: Story = {
  name: 'Recurso YAML (Runbook)',
  args: { code: RESOURCES[2].yaml, language: 'properties' },
};

export const Editor: Story = {
  name: 'Editor (payload)',
  render: () => ({
    props: { code: JSON_PAYLOAD },
    template: `
      <div style="max-width:520px;display:grid;gap:8px">
        <odlq-code-editor [(value)]="code" [rows]="8" language="json" label="Payload" />
        <small style="color:var(--ui-text-muted)">{{ code.length }} caracteres</small>
      </div>`,
  }),
};

export const EditorComLinhas: Story = {
  name: 'Editor com números de linha',
  render: () => ({
    props: { code: JSON_PAYLOAD },
    template: `<odlq-code-editor [(value)]="code" [rows]="8" [lineNumbers]="true" language="json" style="max-width:520px" />`,
  }),
};

export const Diff: Story = {
  name: 'Diff de payload (editar e reenviar)',
  parameters: { layout: 'padded' },
  render: () => ({
    props: { a: BEFORE, b: AFTER },
    template: `<odlq-diff-viewer [left]="a" [right]="b" leftTitle="Original payload" rightTitle="Edited payload" leftMeta="x-dlq-id: 0f3a9c12" rightMeta="Replays under the same id" />`,
  }),
};
