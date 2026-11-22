import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { OdlqIcon } from './icon';
import { ICON_NAMES } from './icons';

const meta: Meta<OdlqIcon> = {
  title: 'Fundação/Icon',
  component: OdlqIcon,
  tags: ['autodocs'],
  args: { name: 'topics', size: 16, strokeWidth: 1.75 },
  argTypes: { name: { control: 'select', options: ICON_NAMES } },
};
export default meta;
type Story = StoryObj<OdlqIcon>;

export const Default: Story = {};

export const Galeria: Story = {
  decorators: [moduleMetadata({ imports: [OdlqIcon] })],
  render: () => ({
    props: { names: ICON_NAMES },
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px">
        @for (n of names; track n) {
          <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--ui-border);border-radius:6px;font:11px var(--ui-font-mono);color:var(--ui-text-muted)">
            <odlq-icon [name]="n" [size]="18" style="color:var(--ui-text)" /> {{ n }}
          </div>
        }
      </div>`,
  }),
};
