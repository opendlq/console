import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { CONNECTOR_CONFIG, DLQ_MESSAGES, JS_FILTER_PLACEHOLDER, SCHEMA_V3, SCHEMA_V4, TOPIC_CONFIG_RAW } from '../mocks';
import { OdlqCodeBlock } from './code-block';
import { OdlqCodeEditor } from './code-editor';
import { OdlqDiffViewer } from './diff-viewer';

const meta: Meta<OdlqCodeBlock> = {
  title: 'Dados/Código (block, editor, diff)',
  component: OdlqCodeBlock,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [OdlqCodeBlock, OdlqCodeEditor, OdlqDiffViewer] })],
  args: { code: DLQ_MESSAGES[0].value, language: 'json', lineNumbers: true, copyable: true },
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
  name: 'Properties (raw view)',
  args: { code: TOPIC_CONFIG_RAW, language: 'properties' },
};

export const Connector: Story = {
  name: 'Config do connector',
  args: { code: CONNECTOR_CONFIG, language: 'json' },
};

export const Editor: Story = {
  name: 'Editor (JS filter)',
  render: () => ({
    props: { code: '' },
    template: `
      <div style="max-width:520px;display:grid;gap:8px">
        <odlq-code-editor [(value)]="code" [rows]="6" language="js" label="Filter code" placeholder='${JS_FILTER_PLACEHOLDER}' />
        <small style="color:var(--ui-text-muted)">{{ code.length }} caracteres</small>
      </div>`,
  }),
};

export const EditorComValor: Story = {
  name: 'Editor com valor e linhas',
  render: () => ({
    props: { code: 'const city = record.value.Address.City\nreturn city.startsWith("Pa") // Paris, Palermo\n' },
    template: `<odlq-code-editor [(value)]="code" [rows]="6" [lineNumbers]="true" language="js" style="max-width:520px" />`,
  }),
};

export const Diff: Story = {
  name: 'Diff de schema',
  parameters: { layout: 'padded' },
  render: () => ({
    props: { a: SCHEMA_V3, b: SCHEMA_V4 },
    template: `<odlq-diff-viewer [left]="a" [right]="b" leftTitle="Version 3 (current)" rightTitle="Version 4" leftMeta="Schema ID: 100123" rightMeta="Schema ID: 100124" />`,
  }),
};
