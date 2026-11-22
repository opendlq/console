export type OdlqSize = 'sm' | 'md' | 'lg';
export type OdlqTone = 'neutral' | 'primary' | 'success' | 'danger' | 'warning' | 'info';

export interface OdlqOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  description?: string;
}

let uid = 0;
/** Id único para ligar rótulos/ARIA (estável por sessão). */
export const nextId = (prefix: string): string => `${prefix}-${++uid}`;
