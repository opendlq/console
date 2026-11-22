import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { OdlqAvatar } from '../avatar/avatar';
import { OdlqIcon } from '../icon/icon';
import { OdlqKbd } from '../kbd/kbd';
import { OdlqChip } from '../chip/chip';
import { OdlqSkeleton } from '../skeleton/skeleton';
import { OdlqSpinner } from '../spinner/spinner';
import { OdlqDivider } from '../divider/divider';
import { OdlqBadge } from './badge';

const meta: Meta<OdlqBadge> = {
  title: 'Primitivos/Badge, Chip e afins',
  component: OdlqBadge,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ imports: [OdlqBadge, OdlqChip, OdlqIcon, OdlqKbd, OdlqAvatar, OdlqSpinner, OdlqSkeleton, OdlqDivider] }),
  ],
  args: { tone: 'success', mono: true, pill: false, dot: false },
  argTypes: { tone: { control: 'select', options: ['neutral', 'primary', 'success', 'danger', 'warning', 'info'] } },
  render: (args) => ({
    props: args,
    template: `<odlq-badge [tone]="tone" [mono]="mono" [pill]="pill" [dot]="dot">Stable</odlq-badge>`,
  }),
};
export default meta;
type Story = StoryObj<OdlqBadge>;

export const Badge: Story = {};

export const Tons: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <odlq-badge mono tone="success"><odlq-icon name="circle-check" [size]="11" /> Stable</odlq-badge>
        <odlq-badge mono tone="success"><odlq-icon name="play" [size]="11" /> Running</odlq-badge>
        <odlq-badge mono tone="danger">Failed</odlq-badge>
        <odlq-badge mono tone="warning">Retrying</odlq-badge>
        <odlq-badge mono tone="info">Preview</odlq-badge>
        <odlq-badge mono tone="primary">Beta</odlq-badge>
        <odlq-badge mono>Parked</odlq-badge>
        <odlq-badge pill>20</odlq-badge>
        <odlq-badge pill tone="danger">1</odlq-badge>
        <odlq-badge tone="success" [dot]="true">Connected</odlq-badge>
      </div>`,
  }),
};

export const Chips: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <odlq-chip [removable]="true" [draggable]="true"><span style="color:var(--ui-text-muted)">js:</span> city-2</odlq-chip>
        <odlq-chip [removable]="true" [draggable]="true"><span style="color:var(--ui-text-muted)">partitions:</span> all partitions</odlq-chip>
        <odlq-chip [removable]="true">key format: string</odlq-chip>
        <odlq-chip [dashed]="true"><odlq-icon name="plus" [size]="12" /> Add label</odlq-chip>
      </div>`,
  }),
};

export const Outros: Story = {
  name: 'Kbd, Avatar, Spinner, Skeleton, Divider',
  render: () => ({
    template: `
      <div style="display:grid;gap:16px;max-width:360px">
        <div style="display:flex;gap:12px;align-items:center">
          <kbd odlq-kbd>⌘ + K</kbd>
          <odlq-avatar name="Alexandro Castro" [size]="28" />
          <odlq-avatar name="Dead Letter" [size]="36" />
          <odlq-spinner />
        </div>
        <odlq-divider />
        <div style="display:grid;gap:8px">
          <odlq-skeleton width="60%" />
          <odlq-skeleton />
          <odlq-skeleton height="40px" />
        </div>
      </div>`,
  }),
};
