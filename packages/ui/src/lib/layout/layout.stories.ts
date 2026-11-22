import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { OdlqAvatar } from '../avatar/avatar';
import { OdlqButton } from '../button/button';
import { OdlqIconButton } from '../button/icon-button';
import { OdlqCommandPalette, type OdlqCommand } from '../command-palette/command-palette';
import { OdlqPagination } from '../pagination/pagination';
import { OdlqTabs, type OdlqTab } from '../tabs/tabs';
import { OdlqAppShell } from './app-shell';
import { OdlqBrand } from './brand';
import { OdlqPageHeader } from './page-header';
import { OdlqNavItem, OdlqNavSection, OdlqSidebar } from './sidebar';
import { OdlqClusterStatus, OdlqSearchTrigger, OdlqTopbar } from './topbar';

const meta: Meta = {
  title: 'Navegação/Layout',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, iframeHeight: 560 } } },
  decorators: [
    moduleMetadata({
      imports: [
        OdlqAppShell, OdlqSidebar, OdlqNavSection, OdlqNavItem, OdlqBrand, OdlqTopbar, OdlqSearchTrigger,
        OdlqClusterStatus, OdlqIconButton, OdlqAvatar, OdlqPageHeader, OdlqTabs, OdlqButton, OdlqPagination, OdlqCommandPalette,
      ],
    }),
  ],
};
export default meta;
type Story = StoryObj;

const tabs: OdlqTab[] = [
  { value: 'consume', label: 'Consume' },
  { value: 'produce', label: 'Produce' },
  { value: 'config', label: 'Configuration' },
  { value: 'schema', label: 'Schema' },
  { value: 'groups', label: 'Consumer Groups' },
  { value: 'acl', label: 'ACL' },
];

const commands: OdlqCommand[] = [
  { id: 'topics', label: 'Go to Topics', group: 'Navigate', icon: 'topics', hint: 'G T' },
  { id: 'dlq', label: 'Go to Dead Letter Queues', group: 'Navigate', icon: 'inbox', hint: 'G D' },
  { id: 'schema', label: 'Go to Schema Registry', group: 'Navigate', icon: 'schema' },
  { id: 'reprocess', label: 'Reprocess selected messages', group: 'Actions', icon: 'reprocess' },
  { id: 'theme', label: 'Toggle theme', group: 'Actions', icon: 'moon' },
];

export const Shell: Story = {
  name: 'App shell completo',
  render: () => ({
    props: { tabs, tab: 'consume', commands, palette: false },
    template: `
      <odlq-app-shell height="560px">
        <odlq-sidebar>
          <odlq-brand brand name="OpenDLQ" [selector]="true" />
          <odlq-nav-section label="Main">
            <a odlq-nav-item icon="topics" [active]="true">Topics</a>
            <a odlq-nav-item icon="consumer-groups">Consumer Groups</a>
            <a odlq-nav-item icon="schema">Schema Registry</a>
            <a odlq-nav-item icon="connect">Kafka Connect</a>
          </odlq-nav-section>
          <odlq-nav-section label="Others">
            <a odlq-nav-item icon="team">Manage Team</a>
            <a odlq-nav-item icon="sql" badge="Preview">SQL</a>
            <a odlq-nav-item icon="catalog" [count]="1">Application Catalog</a>
            <a odlq-nav-item icon="settings">Settings</a>
          </odlq-nav-section>
        </odlq-sidebar>
        <odlq-topbar>
          <button start odlq-search-trigger (click)="palette = true"></button>
          <odlq-cluster-status end name="Confluent pkc-yytws" />
          <button end odlq-icon-button icon="settings" label="Settings"></button>
          <button end odlq-icon-button icon="plus" label="Create" variant="primary" round></button>
          <button end odlq-icon-button icon="help" label="Help"></button>
          <button end odlq-icon-button icon="bell" label="Notifications"></button>
          <odlq-avatar end name="Alexandro Castro" />
        </odlq-topbar>
        <odlq-page-header title="users.registrations" [crumbs]="[{ label: 'Topics' }]">
          <button actions odlq-button variant="outline">Actions</button>
          <odlq-tabs [tabs]="tabs" [(selected)]="tab" label="Topic sections" />
        </odlq-page-header>
        <odlq-command-palette [(open)]="palette" [commands]="commands" />
      </odlq-app-shell>`,
  }),
};

export const Tabs: Story = {
  parameters: { layout: 'padded', docs: { story: { inline: true } } },
  render: () => ({
    props: {
      tabs: [
        { value: 'topics', label: 'Topics', count: 3 },
        { value: 'members', label: 'Members', count: 20 },
        { value: 'alerts', label: 'Alerts', count: 0 },
        { value: 'off', label: 'Disabled', disabled: true },
      ],
      pills: [
        { value: 'data', label: 'Data' },
        { value: 'headers', label: 'Headers' },
        { value: 'meta', label: 'Metadata' },
      ],
      a: 'topics',
      b: 'data',
    },
    template: `
      <div style="display:grid;gap:24px;max-width:560px">
        <odlq-tabs [tabs]="tabs" [(selected)]="a" label="Underline tabs" />
        <odlq-tabs variant="pill" [tabs]="pills" [(selected)]="b" label="Pill tabs" />
      </div>`,
  }),
};

export const Paginacao: Story = {
  parameters: { layout: 'padded', docs: { story: { inline: true } } },
  render: () => ({ template: `<odlq-pagination [total]="260" [pageSize]="50" />` }),
};

export const PaginaPageHeader: Story = {
  name: 'Page header',
  parameters: { layout: 'padded', docs: { story: { inline: true } } },
  render: () => ({
    template: `
      <odlq-page-header title="super-awesome-topic-name" [crumbs]="[{ label: 'Topics' }]">
        <button actions odlq-button variant="outline">Save</button>
        <button actions odlq-button variant="primary">Publish</button>
      </odlq-page-header>`,
  }),
};
