import { DestroyRef, ElementRef, afterNextRender, inject, signal, type Signal } from '@angular/core';

export interface OdlqSeries {
  name: string;
  values: (number | null)[];
  /** Qualquer cor CSS; padrão: paleta `--ui-chart-N`. */
  color?: string;
}

export const seriesColor = (s: OdlqSeries, i: number): string => s.color ?? `var(--ui-chart-${(i % 8) + 1})`;

const compactFmt = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
export const compact = (n: number): string => compactFmt.format(n);

/** Escala "bonita": passo 1/2/2.5/5 × 10ⁿ; devolve o máximo arredondado e os ticks de 0 a max. */
export function niceScale(max: number, count: number): { max: number; ticks: number[] } {
  const safe = max > 0 ? max : 1;
  const raw = safe / Math.max(1, count);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const top = Math.ceil(safe / step - 1e-9) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(Math.round(v * 1e9) / 1e9);
  return { max: ticks[ticks.length - 1], ticks };
}

/** Largura do elemento hospedeiro, atualizada por ResizeObserver. Chamar em contexto de injeção. */
export function useElementWidth(initial = 480): Signal<number> {
  const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  const destroyRef = inject(DestroyRef);
  const width = signal(initial);
  afterNextRender(() => {
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => width.set(Math.floor(entry.contentRect.width) || initial));
    ro.observe(el);
    destroyRef.onDestroy(() => ro.disconnect());
  });
  return width.asReadonly();
}

/** Margens padrão do plot (px). */
export const MARGIN = { l: 44, r: 10, t: 10, b: 24 } as const;
