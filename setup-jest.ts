import { jest } from '@jest/globals';

Object.defineProperty(window, 'CSS', { value: null });

Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>',
});

Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    display: 'none',
    appearance: ['-webkit-appearance'],
  }),
});

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
Element.prototype.scrollIntoView = <typeof Element.prototype.scrollIntoView>jest.fn();

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
HTMLCanvasElement.prototype.getContext = <typeof HTMLCanvasElement.prototype.getContext>jest.fn();

Object.defineProperty(window, 'DragEvent', {
  value: class DragEvent {},
});
