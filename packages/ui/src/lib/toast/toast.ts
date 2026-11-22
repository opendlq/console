import { ChangeDetectionStrategy, Component, Injectable, inject, signal } from '@angular/core';
import { OdlqIcon } from '../icon/icon';
import type { OdlqIconName } from '../icon/icons';

export type OdlqToastTone = 'info' | 'success' | 'warning' | 'danger';
export interface OdlqToast {
  id: number;
  title: string;
  message?: string;
  tone: OdlqToastTone;
}

/** Notificações efêmeras. Renderize `<odlq-toaster />` uma vez no app e chame `show()` de qualquer lugar. */
@Injectable({ providedIn: 'root' })
export class OdlqToastService {
  readonly toasts = signal<OdlqToast[]>([]);
  private nextId = 0;

  show(t: { title: string; message?: string; tone?: OdlqToastTone; duration?: number }): number {
    const id = ++this.nextId;
    this.toasts.update((list) => [...list, { id, title: t.title, message: t.message, tone: t.tone ?? 'info' }]);
    const duration = t.duration ?? 5000;
    if (duration > 0) setTimeout(() => this.dismiss(id), duration);
    return id;
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}

const ICON: Record<OdlqToastTone, OdlqIconName> = {
  info: 'info',
  success: 'circle-check',
  warning: 'warning',
  danger: 'circle-alert',
};

@Component({
  selector: 'odlq-toaster',
  imports: [OdlqIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'region', 'aria-label': 'Notifications', 'aria-live': 'polite' },
  template: `
    @for (t of svc.toasts(); track t.id) {
      <div class="toast" [attr.data-tone]="t.tone" role="status">
        <odlq-icon [name]="icon(t.tone)" [size]="16" class="ico" />
        <div class="txt">
          <strong>{{ t.title }}</strong>
          @if (t.message) {
            <span>{{ t.message }}</span>
          }
        </div>
        <button type="button" aria-label="Dismiss" (click)="svc.dismiss(t.id)"><odlq-icon name="close" [size]="14" /></button>
      </div>
    }
  `,
  styles: `
    :host {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: calc(var(--ui-z-drawer) + 10);
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: min(360px, calc(100vw - 32px));
      pointer-events: none;
    }
    .toast {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-lg);
      background: var(--ui-surface);
      box-shadow: var(--ui-shadow-md);
      font-size: var(--ui-text-md);
      pointer-events: auto;
      animation: rise 160ms cubic-bezier(0.2, 0, 0, 1);
    }
    .txt {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 2px;
    }
    .txt span {
      color: var(--ui-text-muted);
      font-size: var(--ui-text-sm);
    }
    .toast[data-tone='success'] .ico {
      color: var(--ui-success);
    }
    .toast[data-tone='danger'] .ico {
      color: var(--ui-danger);
    }
    .toast[data-tone='warning'] .ico {
      color: var(--ui-warning);
    }
    .toast[data-tone='info'] .ico {
      color: var(--ui-info);
    }
    button {
      display: grid;
      place-items: center;
      padding: 2px;
      border: 0;
      border-radius: var(--ui-radius-sm);
      background: transparent;
      color: var(--ui-text-subtle);
      cursor: pointer;
    }
    button:hover {
      color: var(--ui-text);
    }
    @keyframes rise {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
    }
  `,
})
export class OdlqToaster {
  protected readonly svc = inject(OdlqToastService);
  protected icon(tone: OdlqToastTone): OdlqIconName {
    return ICON[tone];
  }
}
