import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { OdlqCard } from '../card/card';
import { OdlqSegmentedControl } from '../segmented-control/segmented-control';
import { CHARGEBACK, MESSAGES_PER_DAY, RATE_SERIES } from '../mocks';
import { OdlqBarChart } from './bar-chart';
import { OdlqChartLegend } from './legend';
import { OdlqLineChart } from './line-chart';

const meta: Meta<OdlqBarChart> = {
  title: 'Gráficos/Bar, Line e Legend',
  component: OdlqBarChart,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [OdlqBarChart, OdlqLineChart, OdlqChartLegend, OdlqCard, OdlqSegmentedControl] })],
  args: { stacked: false, height: 200 },
  render: (args) => ({
    props: { ...args, categories: MESSAGES_PER_DAY.categories, series: [{ name: 'Messages', values: MESSAGES_PER_DAY.values }] },
    template: `<odlq-bar-chart [categories]="categories" [series]="series" [height]="height" label="Messages per day" />`,
  }),
};
export default meta;
type Story = StoryObj<OdlqBarChart>;

export const Histograma: Story = {};

export const Empilhado: Story = {
  render: () => ({
    props: { categories: CHARGEBACK.categories, series: CHARGEBACK.series, fmt: (n: number) => '$' + n.toFixed(1) + 'K' },
    template: `
      <odlq-card heading="Key metrics">
        <odlq-chart-legend [series]="series" [max]="4" style="margin-bottom:12px" />
        <odlq-bar-chart [categories]="categories" [series]="series" [stacked]="true" [height]="240" [yFormat]="fmt" label="Cost per service account" />
      </odlq-card>`,
  }),
  args: {},
};

export const Linhas: Story = {
  render: () => ({
    props: {
      fmt: (n: number) => n.toFixed(1),
      range: '1D',
      ranges: ['1H', '1D', '7D', '30D'].map((r) => ({ value: r, label: r })),
      categories: RATE_SERIES.categories,
      produce: [{ name: 'Produce', values: RATE_SERIES.produce, color: 'var(--ui-info)' }],
      consume: [{ name: 'Consume', values: RATE_SERIES.consume, color: 'var(--ui-info)' }],
    },
    template: `
      <div style="display:grid;gap:16px;grid-template-columns:1fr 1fr">
        <odlq-card heading="Produce rate">
          <odlq-line-chart [series]="produce" [categories]="categories" unit="msg/s" [yFormat]="fmt" [area]="true" label="Produce rate" />
        </odlq-card>
        <odlq-card heading="Consume rate">
          <odlq-segmented-control actions [options]="ranges" [(value)]="range" size="sm" label="Range" />
          <odlq-line-chart [series]="consume" [categories]="categories" unit="msg/s" [yFormat]="fmt" label="Consume rate" />
        </odlq-card>
      </div>`,
  }),
  args: {},
};
