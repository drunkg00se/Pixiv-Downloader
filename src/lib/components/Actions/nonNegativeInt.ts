import type { Action } from 'svelte/action';
import type { Writable } from 'svelte/store';

interface ObjectStoreParams {
  store: Writable<object>;
  key: string;
}

type Params = Writable<number> | ObjectStoreParams;

export const nonNegativeInt: Action<HTMLInputElement, Params> = (node, params: Params) => {
  if (!(node instanceof HTMLInputElement) || node.type !== 'number')
    throw new Error('Node should be an HTMLInputElement with a `type` of "number".');

  const resetStore = (newVal?: number) => {
    if ('key' in params) {
      const { key, store } = params;

      store.update((currentVal) => {
        if (typeof newVal === 'number') {
          return { ...currentVal, [key]: newVal };
        } else {
          return currentVal;
        }
      });
    } else {
      params.update((currentVal) => {
        if (typeof newVal === 'number') {
          if (currentVal === newVal) {
            node.value = '' + newVal;
          }

          return newVal;
        } else {
          // return same val does not trigger update, so we need to update node.value manually;
          const nodeValToNumber = node.value === '' ? null : +node.value;
          nodeValToNumber !== currentVal &&
            (node.value = typeof currentVal === 'number' ? '' + currentVal : '');
          return currentVal;
        }
      });
    }
  };

  node.addEventListener('input', (evt) => {
    const el = evt.currentTarget as HTMLInputElement;
    const { min, max, value } = el;

    const minVal = min === '' ? 0 : +min;
    const maxVal = max === '' ? null : +max;

    if (!el.checkValidity()) {
      if (/^[0-9]+$/.test(value)) {
        const numVal = +value;

        if (numVal < minVal) {
          resetStore(minVal);
        } else if (maxVal && numVal > maxVal) {
          resetStore(maxVal);
        }
      } else {
        resetStore();
      }
    }
  });

  node.addEventListener('blur', (evt) => {
    const el = evt.currentTarget as HTMLInputElement;
    const { min, value } = el;

    const minVal = min === '' ? 0 : +min;

    if (value === '') {
      resetStore(minVal);
    }
  });

  return {};
};
