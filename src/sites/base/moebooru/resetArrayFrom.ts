// moebooru uses a pollyfill for `Array.from`, which doesn't support `Set` as an argument,
// and breaks svelte5's `event_handle(array_from(all_registered_events))` in `_mount` function.

(() => {
  if (/\[native code\]/.test(Array.from.toString())) return;

  const iframe = document.createElement('iframe');
  document.body.append(iframe);
  Array.from = (iframe.contentWindow as typeof window).Array.from;
  iframe.remove();
})();
