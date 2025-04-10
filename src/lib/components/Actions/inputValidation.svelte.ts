import type { Action } from 'svelte/action';
import { on } from 'svelte/events';

type DataToValidate = {
  get(): number;
  set(value: number): void;
};

export const inputValidation: Action<HTMLInputElement, DataToValidate> = (
  node: HTMLInputElement,
  value: DataToValidate
) => {
  $effect(() => {
    node.value = String(value.get());
  });

  $effect(() => {
    const off = on(node, 'input', function validate() {
      const isValid = this.reportValidity();
      if (isValid) {
        this.classList.remove('input-error');
        value.set(+this.value);
      } else {
        this.classList.add('input-error');
      }
    });

    return () => {
      off();
    };
  });
};
