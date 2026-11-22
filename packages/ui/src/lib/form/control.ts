import {
  Directive,
  forwardRef,
  input,
  booleanAttribute,
  computed,
  signal,
  type ModelSignal,
  type Provider,
  type Type,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';

/** Registra o componente como ControlValueAccessor (ngModel / formControl). */
export const provideControl = (impl: () => Type<unknown>): Provider => ({
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(impl),
  multi: true,
});

/**
 * Base dos controles de formulário: `value` é um `model()` (use `[(value)]`) e o
 * componente também funciona com Angular Forms via ControlValueAccessor.
 */
@Directive()
export abstract class OdlqControl<T> implements ControlValueAccessor {
  abstract readonly value: ModelSignal<T>;
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  private onChange: (v: T) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  writeValue(v: T): void {
    this.value.set(v);
  }
  registerOnChange(fn: (v: T) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }
  /** Atualiza o valor por ação do usuário e notifica o Angular Forms. */
  protected commit(v: T): void {
    this.value.set(v);
    this.onChange(v);
  }
}
