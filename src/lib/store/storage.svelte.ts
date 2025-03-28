/**
 * fork from
 * https://github.com/Rich-Harris/local-storage-test
 */

import { tick } from 'svelte';

export class LocalStorage<T extends object> {
  protected key: string;
  protected value: T;
  protected listeners = 0;

  #proxies = new WeakMap();
  #version = $state(0);

  #handler = (e: StorageEvent) => {
    if (e.storageArea !== localStorage) return;
    if (e.key !== this.key) return;

    console.log('watch storage change');

    this.#version += 1;
  };

  constructor(key: string, initial: T) {
    this.key = key;

    if (typeof localStorage !== 'undefined') {
      const item = localStorage.getItem(key);

      if (!item) {
        this.value = initial;
        localStorage.setItem(key, JSON.stringify(initial));
      } else {
        this.value = this.#mergeDefaultStore(JSON.parse(item), initial);
      }
    } else {
      this.value = initial;
    }

    window.addEventListener('storage', (e) => {
      if (e.storageArea !== localStorage || e.key !== this.key) return;
      console.log('storage change');
      this.value = e.newValue === null ? null : JSON.parse(e.newValue);
    });
  }

  #mergeDefaultStore<DefaultStore, BaseObject extends object>(
    baseObject: BaseObject,
    defaultStore: DefaultStore
  ): DefaultStore {
    const obj = Object.assign({}, defaultStore);

    for (const key in defaultStore) {
      const baseVal = (baseObject as any)[key];
      const defaultVal = obj[key];

      if (typeof baseVal === 'object' && typeof defaultVal === 'object') {
        this.#mergeDefaultStore(baseVal, defaultVal);
      } else if (baseVal !== undefined) {
        obj[key] = baseVal;
      }
    }

    return obj;
  }

  #proxy(value: unknown) {
    if (typeof value !== 'object' || value === null) {
      return value;
    }

    let p = this.#proxies.get(value);

    if (!p) {
      console.log('create new Proxy');

      p = new Proxy(value, {
        get: (target, property) => {
          this.#version;
          return this.#proxy(Reflect.get(target, property));
        },
        set: (target, property, value) => {
          this.#version += 1;
          Reflect.set(target, property, value);

          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.key, JSON.stringify(this.value));
          }

          return true;
        }
      });

      this.#proxies.set(value, p);
    }

    return p;
  }

  get current(): T {
    this.#version;

    if ($effect.tracking()) {
      $effect(() => {
        if (this.listeners === 0) {
          console.log('add listerners');
          window.addEventListener('storage', this.#handler);
        }

        this.listeners += 1;
        return () => {
          tick().then(() => {
            this.listeners -= 1;
            if (this.listeners === 0) {
              console.log('remove listerners');
              window.removeEventListener('storage', this.#handler);
            }
          });
        };
      });
    }

    return this.#proxy(this.value);
  }

  set current(value) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.key, JSON.stringify(value));
    }

    this.value = value;

    this.#version += 1;
  }
}
