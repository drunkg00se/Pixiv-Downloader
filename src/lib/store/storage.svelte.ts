import { channelEvent } from '../channelEvent';
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
  let version = 0;
  let syncVersion = 0;

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
      if (version === 0) {
        version = Date.now();
      } else if (version < syncVersion) {
        version = syncVersion;
      } else {
        version = Date.now();
        channelEvent.emit(`sync:${key}`, {
          version,
          data: $state.snapshot(state)
        });
      }

      localStorage.setItem(key, JSON.stringify(state));
    });
  });

  channelEvent.on(`sync:${key}`, ({ version: v, data }: { version: number; data: State }) => {
    if (v <= version) return;
    syncVersion = v;
    state = data;
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
