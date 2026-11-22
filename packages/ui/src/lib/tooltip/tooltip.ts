import { Overlay, type OverlayRef, type ConnectedPosition } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  OnDestroy,
  inject,
  input,
} from '@angular/core';
import { nextId } from '../types';

type Side = 'top' | 'bottom' | 'left' | 'right';

const POSITIONS: Record<Side, ConnectedPosition> = {
  top: { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -6 },
  bottom: { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 6 },
  left: { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -6 },
  right: { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 6 },
};

@Component({
  selector: 'odlq-tooltip-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'tooltip', '[id]': 'tipId()' },
  template: `{{ text() }}`,
  styles: `
    :host {
      display: block;
      max-width: 260px;
      padding: 5px 8px;
      border-radius: var(--ui-radius-md);
      background: var(--ui-text);
      color: var(--ui-bg);
      font-size: var(--ui-text-sm);
      line-height: 1.35;
      box-shadow: var(--ui-shadow-md);
      pointer-events: none;
    }
  `,
})
export class OdlqTooltipPanel {
  readonly text = input('');
  readonly tipId = input('');
}

/** Tooltip acessível por hover/foco: `<button odlqTooltip="Copiar">`. */
@Directive({
  selector: '[odlqTooltip]',
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focusin)': 'show()',
    '(focusout)': 'hide()',
    '(keydown.escape)': 'hide()',
    '[attr.aria-describedby]': 'ref ? tipId : null',
  },
})
export class OdlqTooltip implements OnDestroy {
  readonly text = input.required<string>({ alias: 'odlqTooltip' });
  readonly side = input<Side>('top', { alias: 'odlqTooltipSide' });

  private readonly overlay = inject(Overlay);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly tipId = nextId('odlq-tip');
  protected ref: OverlayRef | null = null;

  protected show(): void {
    if (this.ref || !this.text()) return;
    const fallback = POSITIONS[this.side() === 'top' ? 'bottom' : 'top'];
    this.ref = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.el)
        .withPositions([POSITIONS[this.side()], fallback]),
      scrollStrategy: this.overlay.scrollStrategies.close(),
    });
    const cmp = this.ref.attach(new ComponentPortal(OdlqTooltipPanel));
    cmp.setInput('text', this.text());
    cmp.setInput('tipId', this.tipId);
  }

  protected hide(): void {
    this.ref?.dispose();
    this.ref = null;
  }

  ngOnDestroy(): void {
    this.hide();
  }
}
