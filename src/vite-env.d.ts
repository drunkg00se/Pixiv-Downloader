/// <reference types="vite/client" />
/// <reference types="vite-plugin-monkey/client" />
/// <reference types="@poppanator/sveltekit-svg/dist/svg" />

declare const __VERSION__: string;

declare module '*?rawjs' {
  const content: string;
  export default content;
}

declare module 'svelte/internal/client' {
  import { Component } from 'svelte';

  type CustomElementPropDefinition = {
    attribute?: string;
    reflect?: boolean;
    type?: 'String' | 'Boolean' | 'Number' | 'Array' | 'Object';
  };

  /**
   * @description Turn a Svelte component into a custom element.
   */
  export const create_custom_element: <
    Props extends Record<string, unknown> = object,
    Exports extends Record<string, unknown> = object,
    Bindings extends keyof Props | '' = string,
    CustomElment extends HTMLElement = HTMLElement,
    CustomElmentProps extends unknown[] = []
  >(
    /** A Svelte component function */
    Component: Component<Props, Exports, Bindings>,
    /** The props to observe */
    props_definition: Record<string, CustomElementPropDefinition>,
    /** The slots to create */
    slots: string[],
    /** Explicitly exported values, other than props */
    exports: string[],
    /** Whether to use shadow DOM */
    use_shadow_dom: boolean,
    extend: (ce: new () => HTMLElement) => new (...args: CustomElmentProps) => CustomElment
  ) => new (...args: CustomElmentProps) => CustomElment & Exports;
}

declare type ReactiveValue<T> = { current: T };
