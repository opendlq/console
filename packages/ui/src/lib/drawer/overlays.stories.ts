import { CdkMenuItem } from '@angular/cdk/menu';
import { Component, inject } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { OdlqButton } from '../button/button';
import { OdlqIconButton } from '../button/icon-button';
import { OdlqFormField } from '../form-field/form-field';
import { OdlqInput } from '../input/input';
import { OdlqConfirmDialog, OdlqModal } from '../modal/modal';
import { OdlqMenu, OdlqMenuItem, OdlqMenuSeparator, OdlqMenuTrigger } from '../menu/menu';
import { OdlqSelect } from '../select/select';
import { OdlqTabs } from '../tabs/tabs';
import { OdlqToastService, OdlqToaster } from '../toast/toast';
import { OdlqDrawer } from './drawer';

const meta: Meta<OdlqDrawer> = {
  title: 'Overlays/Drawer, Modal, Menu e Toast',
  component: OdlqDrawer,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, iframeHeight: 420 } } },
  decorators: [
    moduleMetadata({
      imports: [
        OdlqDrawer, OdlqButton, OdlqIconButton, OdlqModal, OdlqConfirmDialog, OdlqMenu, OdlqMenuItem, OdlqMenuSeparator,
        OdlqMenuTrigger, OdlqToaster, OdlqInput, OdlqFormField, OdlqSelect, OdlqTabs, CdkMenuItem,
      ],
    }),
  ],
};
export default meta;
type Story = StoryObj<OdlqDrawer>;

export const ReprocessDrawer: Story = {
  name: 'Drawer (Reprocess message)',
  render: () => ({
    props: {
      open: true,
      topics: ['super-awesome-topic-name', 'orders.dlq', 'payments.dlq'].map((t) => ({ value: t, label: t })),
      topic: 'super-awesome-topic-name',
    },
    template: `
      <div style="padding:16px"><button odlq-button variant="primary" (click)="open = true">Open drawer</button></div>
      <odlq-drawer [(open)]="open" heading="Reprocess message" [back]="true">
        <p style="margin:0 0 16px;color:var(--ui-text-muted)">Message reprocessing lets you send a message again to the same or to a new topic, optionally editing the Key, Value and Headers prior to resending.</p>
        <odlq-form-field label="Topic"><odlq-select [options]="topics" [(value)]="topic" label="Topic" style="display:block" /></odlq-form-field>
        <ng-container footer>
          <button odlq-button variant="secondary" (click)="open = false">Cancel</button>
          <button odlq-button variant="primary">Edit and publish</button>
        </ng-container>
      </odlq-drawer>`,
  }),
};

export const Modal: Story = {
  render: () => ({
    props: { open: true },
    template: `
      <div style="padding:16px"><button odlq-button variant="outline" (click)="open = true">Open modal</button></div>
      <odlq-modal [(open)]="open" heading="Discard 3 messages?">
        Discarded messages are removed from the dead letter topic and cannot be reprocessed.
        <ng-container footer>
          <button odlq-button variant="outline" (click)="open = false">Cancel</button>
          <button odlq-button variant="danger" (click)="open = false">Discard</button>
        </ng-container>
      </odlq-modal>`,
  }),
};

export const Confirmacao: Story = {
  name: 'Confirm dialog (Delete topic)',
  render: () => ({
    props: { open: true },
    template: `
      <div style="padding:16px"><button odlq-button variant="danger-soft" (click)="open = true">Delete topic</button></div>
      <odlq-confirm-dialog [(open)]="open" heading="Delete topic" confirmLabel="Delete topic" requireText="orders.dlq"
        message="This permanently deletes the topic and all of its messages. This action cannot be undone." />`,
  }),
};

export const Menu: Story = {
  render: () => ({
    template: `
      <div style="padding:16px;display:flex;justify-content:flex-end">
        <button odlq-icon-button icon="more" label="Topic actions" variant="outline" [odlqMenuTrigger]="actions"></button>
      </div>
      <ng-template #actions>
        <odlq-menu>
          <button odlq-menu-item icon="eraser">Empty topic</button>
          <button odlq-menu-item icon="download">Export messages</button>
          <odlq-menu-separator />
          <button odlq-menu-item icon="trash" tone="danger">Delete topic</button>
        </odlq-menu>
      </ng-template>`,
  }),
};

@Component({
  selector: 'toast-demo',
  imports: [OdlqButton, OdlqToaster],
  template: `
    <div style="padding:16px;display:flex;gap:8px">
      <button odlq-button variant="outline" (click)="ok()">Success toast</button>
      <button odlq-button variant="outline" (click)="fail()">Error toast</button>
    </div>
    <odlq-toaster />`,
})
class ToastDemo {
  private readonly toasts = inject(OdlqToastService);
  ok = () => this.toasts.show({ title: '42 messages reprocessed', message: 'Sent to orders.created', tone: 'success' });
  fail = () => this.toasts.show({ title: 'Reprocess failed', message: 'Topic orders.created is unavailable', tone: 'danger' });
}

export const Toast: Story = {
  render: () => ({ template: `<toast-demo />`, moduleMetadata: { imports: [ToastDemo] } }),
};
