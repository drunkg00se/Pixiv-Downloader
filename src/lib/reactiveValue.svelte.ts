/**
 * https://github.com/sveltejs/svelte/blob/main/packages/svelte/src/reactivity/reactive-value.js
 */

import { createSubscriber } from 'svelte/reactivity';

export class ReactiveValue<T> {
  #fn: () => T;
  #subscribe: ReturnType<typeof createSubscriber>;

  constructor(fn: () => T, onsubscribe: Parameters<typeof createSubscriber>[0]) {
    this.#fn = fn;
    this.#subscribe = createSubscriber(onsubscribe);
  }

  get current() {
    this.#subscribe();
    return this.#fn();
  }
}
