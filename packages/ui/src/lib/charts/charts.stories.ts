import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { OdlqCard } from '../card/card';
import { OdlqSegmentedControl } from '../segmented-control/segmented-control';
import COST from '../dlq/__fixtures__/cost.json';
import INFLOW from '../dlq/__fixtures__/inflow.json';
import { OdlqSparkline } from './sparkline';
import { OdlqBarChart } from './bar-chart';
import { OdlqChartLegend } from './legend';
import { OdlqLineChart } from './line-chart';

const meta: Meta<OdlqBarChart> = {
  title: 'Gráficos/Bar, Line e Legend',
  component: OdlqBarChart,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [OdlqBarChart, OdlqLineChart, OdlqChartLegend, OdlqCard, OdlqSegmentedControl, OdlqSparkline] })],
  args: { stacked: false, height: 200 },
  render: (args) => ({
    props: { ...args, categories: INFLOW.categories, series: [{ name: 'Messages in', values: INFLOW.in }] },
    template: `<odlq-bar-chart [categories]="categories" [series]="series" [height]="height" label="Messages arriving in the DLQ per hour" />`,
  }),
};
export default meta;
type Story = StoryObj<OdlqBarChart>;

export const Histograma: Story = {};

export const Empilhado: Story = {
  render: () => ({
    props: { categories: COST.categories, series: COST.series, fmt: (n: number) => '$' + n },
    template: `
      <odlq-card heading="Cost per cause">
        <odlq-chart-legend [series]="series" style="margin-bottom:12px" />
        <odlq-bar-chart [categories]="categories" [series]="series" [stacked]="true" [height]="260" [yFormat]="fmt" label="Cost per cause: storage, replay and operator time" />
      </odlq-card>`,
  }),
  args: {},
};

export const Linhas: Story = {
  render: () => ({
    props: {
      range: '1D',
      ranges: ['1H', '1D', '7D', '30D'].map((r) => ({ value: r, label: r })),
      categories: INFLOW.categories,
      flow: [
        { name: 'In', values: INFLOW.in, color: 'var(--ui-danger)' },
        { name: 'Out', values: INFLOW.out, color: 'var(--ui-success-solid)' },
      ],
    },
    template: `
      <odlq-card heading="Inflow vs. outflow">
        <odlq-segmented-control actions [options]="ranges" [(value)]="range" size="sm" label="Range" />
        <odlq-chart-legend [series]="flow" style="margin-bottom:12px" />
        <odlq-line-chart [series]="flow" [categories]="categories" unit="msg" [area]="true" label="Messages in and out of the DLQ per hour" />
      </odlq-card>`,
  }),
  args: {},
};

export const Sparkline: Story = {
  render: () => ({
    props: { values: INFLOW.in },
    template: `<div style="display:flex;gap:24px;align-items:center"><odlq-sparkline [values]="values" label="Arrivals per hour" /><odlq-sparkline [values]="values" [width]="160" [height]="40" color="var(--ui-danger)" label="Arrivals per hour" /></div>`,
  }),
  args: {},
};
