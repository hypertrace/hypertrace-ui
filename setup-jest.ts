import { jest } from '@jest/globals';

Object.defineProperty(window, 'CSS', { value: null });

Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>'
});

Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    display: 'none',
    appearance: ['-webkit-appearance']
  })
});

// /**
//  * ISSUE: https://github.com/angular/material2/issues/7101
//  * Workaround for JSDOM missing transform property
//  */
// Object.defineProperty(document.body.style, 'transform', {
//   value: () => ({
//     enumerable: true,
//     configurable: true
//   })
// });

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
Element.prototype.scrollIntoView = <typeof Element.prototype.scrollIntoView>jest.fn();

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
HTMLCanvasElement.prototype.getContext = <typeof HTMLCanvasElement.prototype.getContext>jest.fn();

Object.defineProperty(window, 'DragEvent', {
  value: class DragEvent {}
});
