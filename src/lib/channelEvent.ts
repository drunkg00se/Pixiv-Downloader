type ChannelMessageData = {
  eventName: string;
  args: any[];
};

type Listeners = (...args: any[]) => void;

type ListenersArgs<
  EventMap extends object,
  EventName extends string
> = EventName extends keyof EventMap
  ? [EventMap[EventName]] extends [never]
    ? []
    : EventMap[EventName] extends unknown[]
      ? EventMap[EventName]
      : [EventMap[EventName]]
  : any[];

class ChannelEvent {
  #channel: BroadcastChannel;

  #event: Record<string, Set<Listeners>>;

  constructor(channelName: string) {
    this.#channel = new BroadcastChannel(channelName);

    this.#event = {};

    this.#channel.onmessage = (event) => {
      const { eventName, args } = event.data;

      if (!this.#event[eventName]) return;

      this.#event[eventName].forEach((callback) => callback(...args));
    };
  }

  on<M extends object, N extends string>(
    eventName: N,
    callback: (...args: ListenersArgs<M, N>) => void
  ) {
    this.#event[eventName] ??= new Set();

    this.#event[eventName].add(callback);
  }

  off(eventName: string, callback: Listeners) {
    if (!this.#event[eventName]) return;

    this.#event[eventName].delete(callback);
  }

  emit<M extends object, N extends string>(eventName: N, ...args: ListenersArgs<M, N>) {
    const data: ChannelMessageData = { eventName, args };

    this.#channel.postMessage(data);
  }

  once<M extends object, N extends string>(
    eventName: N,
    callback: (...args: ListenersArgs<M, N>) => void
  ) {
    const onceCallback = (...args: ListenersArgs<M, N>) => {
      callback(...args);
      this.off(eventName, onceCallback);
    };

    this.on(eventName, onceCallback);
  }
}

export const channelEvent = new ChannelEvent('pixiv-downloader');
