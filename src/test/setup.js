import { beforeEach, expect as vitestExpect } from 'vitest';

// Minimal localStorage polyfill for Vitest/jsdom environment
const createStorage = () => {
  let store = Object.create(null);
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = Object.create(null);
    },
  };
};

if (!globalThis.localStorage || typeof globalThis.localStorage.clear !== 'function') {
  globalThis.localStorage = createStorage();
}

// ensure a clean storage between tests
beforeEach(() => {
  if (globalThis.localStorage && typeof globalThis.localStorage.clear === 'function') {
    globalThis.localStorage.clear();
  }
});

// Expose Vitest's expect to satisfy jest-dom, then add matchers
globalThis.expect = vitestExpect;
// Dynamically import jest-dom after `expect` is available
(async () => {
  await import('@testing-library/jest-dom');
})();
