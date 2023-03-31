// eslint-disable-next-line import/no-unassigned-import
import 'jest-preset-angular/setup-jest';

Object.defineProperty(window, 'DragEvent', {
  value: class DragEvent {}
});
