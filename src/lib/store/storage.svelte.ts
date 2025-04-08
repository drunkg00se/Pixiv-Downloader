import { isPlainObject } from '../util';
import { toStore, type Readable, type Writable } from 'svelte/store';

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

function mergeDeepState<T extends LocalStorageState>(patch: DeepPartial<T>, stateToPatch: T): T {
  for (const key of Object.keys(patch)) {
    // remove useless states when initializing.
    if (!(key in stateToPatch)) continue;

    const patchVal = patch[key];
    const stateVal = stateToPatch[key];

    if (isPlainObject(patchVal) && isPlainObject(stateVal)) {
      mergeDeepState(patchVal as DeepPartial<LocalStorageState>, stateVal as LocalStorageState);
    } else if (patchVal !== undefined) {
      (stateToPatch[key] as LocalStorageBaseValueType) = patchVal as LocalStorageBaseValueType;
    }
  }

  return stateToPatch;
}

type PersistedStore<
  State extends LocalStorageState,
  Proto extends object & ThisType<State> = object & ThisType<State>
> = {
  $state: Readonly<State>;
  $subscribe: Readable<State>['subscribe'];
  $update: Writable<State>['update'];
} & State &
  Proto;

export function createPersistedStore<
  State extends LocalStorageState,
  Proto extends object & ThisType<State> = object & ThisType<State>
>(key: string, initialValue: State, proto?: Proto): PersistedStore<State, Proto> {
  const storageValue = localStorage.getItem(key);

  let state = $state(
    storageValue
      ? mergeDeepState(JSON.parse(storageValue), Object.assign({}, initialValue))
      : initialValue
  );

  const writable = toStore(
    () => state,
    (newState: State) => (state = newState)
  );

  $effect.root(() => {
    $effect(() => {
      localStorage.setItem(key, JSON.stringify(state));
    });
  });

  window.addEventListener('storage', (e) => {
    if (e.storageArea !== localStorage || e.key !== key || !e.newValue) return;
    console.log('storage change');

    state = JSON.parse(e.newValue);
  });

  const store = Object.create(proto ? proto : null) as PersistedStore<State, Proto>;

  Object.defineProperties(store, {
    $state: {
      get() {
        return state;
      }
    },
    $subscribe: {
      value: writable.subscribe
    },
    $update: {
      value: writable.update
    }
  });

  for (const storeKey of Object.keys(state)) {
    Object.defineProperty(store, storeKey, {
      enumerable: true,
      get() {
        return state[storeKey];
      },
      set(v) {
        state[storeKey as keyof typeof state] = v;
      }
    });
  }

  return store;
}
