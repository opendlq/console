import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { OdlqAccordion, OdlqAccordionItem } from '../accordion/accordion';
import { OdlqButton } from '../button/button';
import { OdlqEmptyState } from '../empty-state/empty-state';
import { OdlqInlineStats, OdlqKpiCard, OdlqKpiRow } from '../kpi/kpi';
import { OdlqProgress } from '../progress/progress';
import { OdlqCard } from './card';
import { OdlqDocPanel } from './doc-panel';

const meta: Meta<OdlqCard> = {
  title: 'Dados/Card, KPI e estados',
  component: OdlqCard,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [OdlqCard, OdlqDocPanel, OdlqAccordion, OdlqAccordionItem, OdlqKpiCard, OdlqKpiRow, OdlqInlineStats, OdlqProgress, OdlqEmptyState, OdlqButton],
    }),
  ],
  args: { heading: 'Cluster state', flush: false, muted: false },
  render: (args) => ({
    props: args,
    template: `<odlq-card [heading]="heading" [flush]="flush" [muted]="muted" style="max-width:420px"><button actions odlq-button size="sm" variant="ghost">Broker graphs</button>Healthy</odlq-card>`,
  }),
};
export default meta;
type Story = StoryObj<OdlqCard>;

export const Card: Story = {};

export const Kpis: Story = {
  name: 'KPI cards',
  render: () => ({
    template: `
      <odlq-kpi-row>
        <odlq-kpi-card label="Records" value="260" />
        <odlq-kpi-card label="Topic size" value="1MB" />
        <odlq-kpi-card label="Partitions" value="7" />
        <odlq-kpi-card label="Replication factor" value="3" />
        <odlq-kpi-card label="< Min ISR" value="0" tone="success" />
        <odlq-kpi-card label="Is compacted" value="YES" />
      </odlq-kpi-row>`,
  }),
};

export const Metricas: Story = {
  name: 'Inline stats',
  render: () => ({
    props: {
      items: [
        { label: 'State', value: 'Stable', badge: 'success' },
        { label: 'Consume rate', value: '86,031.69 msg/s' },
        { label: 'Offset lag', value: '192,819,241' },
        { label: 'Time lag', value: '2h 46m 32s' },
      ],
    },
    template: `<odlq-inline-stats [items]="items" />`,
  }),
};

export const Progresso: Story = {
  render: () => ({
    template: `
      <div style="display:grid;gap:12px;max-width:360px">
        <odlq-progress [value]="40" tone="warning" label="Health score" />
        <odlq-progress [value]="88" tone="success" label="Distribution" />
        <odlq-progress [value]="12" tone="danger" label="Errors" />
      </div>`,
  }),
};

export const Acordeao: Story = {
  name: 'Accordion',
  render: () => ({
    template: `
      <odlq-accordion style="max-width:420px">
        <odlq-accordion-item heading="Key">Key editor</odlq-accordion-item>
        <odlq-accordion-item heading="Value" [expanded]="true">Value editor</odlq-accordion-item>
        <odlq-accordion-item heading="Headers">Headers</odlq-accordion-item>
        <odlq-accordion-item heading="Flow">Flow</odlq-accordion-item>
        <odlq-accordion-item heading="Options">Options</odlq-accordion-item>
      </odlq-accordion>`,
  }),
};

export const Documentacao: Story = {
  name: 'Doc panel',
  render: () => ({
    props: {
      tabs: ['Basics', 'Parameters', 'Functions', 'Examples'].map((t) => ({ value: t.toLowerCase(), label: t })),
      sel: 'basics',
    },
    template: `
      <odlq-doc-panel [tabs]="tabs" [(selected)]="sel" style="max-width:420px">
        <ul style="margin:0;padding-left:18px">
          <li>The filter code is a JavaScript function body.</li>
          <li>Return <code>true</code> to select a record, <code>false</code> to discard it.</li>
          <li>Multiple active filters are combined with a logical “or”.</li>
        </ul>
      </odlq-doc-panel>`,
  }),
};

export const Vazio: Story = {
  name: 'Empty state',
  render: () => ({
    template: `
      <div style="display:grid;gap:16px;grid-template-columns:1fr 1fr">
        <odlq-card><odlq-empty-state /></odlq-card>
        <odlq-card><odlq-empty-state illustration="inbox" title="No dead letters" description="Everything was processed successfully.">
          <button actions odlq-button variant="outline">Refresh</button>
        </odlq-empty-state></odlq-card>
      </div>`,
  }),
};
