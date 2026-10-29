import '@testing-library/jest-dom/vitest';

// Polyfill window.matchMedia for tests
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  // Polyfill scrollIntoView
  Element.prototype.scrollIntoView = () => {};

  // Polyfill navigator.clipboard
  Object.assign(navigator, {
    clipboard: {
      writeText: async () => {},
      readText: async () => '',
    },
  });
}
