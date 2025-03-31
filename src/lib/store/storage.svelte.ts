/**
 * fork from
 * https://github.com/Rich-Harris/local-storage-test
 */

import { tick } from 'svelte';
import { isPlainObject } from '../util';

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

type LocalStorageBaseValueType =
  | number
  | string
  | boolean
  | null
  | Array<LocalStorageBaseValueType>;

type LocalStorageValueType = LocalStorageState | LocalStorageBaseValueType;

type LocalStorageState = {
  [k: string]: LocalStorageValueType;
};

type Subscriber<T> = (state: T) => void;

export class LocalStorage<T extends LocalStorageState> {
  protected key: string;
  protected value: T;
  protected listeners = 0;

  #proxies = new WeakMap();
  #version = $state(0);

  #subscriptions: Subscriber<T>[] = [];

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
        this.value = this.#mergeDeepState(JSON.parse(item), Object.assign({}, initial));
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

  #mergeDeepState<T extends LocalStorageState>(patch: DeepPartial<T>, stateToPatch: T): T {
    for (const key of Object.keys(patch)) {
      // remove useless states when initializing.
      if (!(key in stateToPatch)) continue;

      const patchVal = patch[key];
      const stateVal = stateToPatch[key];

      if (isPlainObject(patchVal) && isPlainObject(stateVal)) {
        this.#mergeDeepState(
          patchVal as DeepPartial<LocalStorageState>,
          stateVal as LocalStorageState
        );
      } else if (patchVal !== undefined) {
        (stateToPatch[key] as LocalStorageBaseValueType) = patchVal as LocalStorageBaseValueType;
      }
    }

    return stateToPatch;
  }

  public patch(patchStateOrFn: Partial<T> | Subscriber<T>) {
    this.#version += 1;

    if (typeof patchStateOrFn === 'function') {
      patchStateOrFn(this.value);
    } else {
      this.#mergeDeepState(patchStateOrFn, this.value);
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.key, JSON.stringify(this.value));
    }

    this.#runSubscriptions();
  }

  #runSubscriptions() {
    this.#subscriptions.slice().forEach((subscriber) => subscriber(this.value));
  }

  public subscribe(subscriber: Subscriber<T>) {
    this.#subscriptions.push(subscriber);

    return () => {
      const idx = this.#subscriptions.indexOf(subscriber);
      if (idx > -1) {
        this.#subscriptions.splice(idx, 1);
      }
    };
  }

  #proxy(value: unknown) {
    if (typeof value !== 'object' || value === null) {
      return value;
    }

    let p = this.#proxies.get(value);

    if (!p) {
      console.log('create new Proxy', value);

      p = new Proxy(value, {
        get: (target, property) => {
          this.#version;
          return this.#proxy(Reflect.get(target, property));
        },
        set: (target, property, value) => {
          $inspect.trace();

          this.#version += 1;

          Reflect.set(target, property, value);

          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.key, JSON.stringify(this.value));
          }

          this.#runSubscriptions();

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
    this.#version += 1;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.key, JSON.stringify(value));
    }

    this.value = value;

    this.#runSubscriptions();
  }
}
