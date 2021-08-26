import { TableWidgetRowSelectionModel } from './table-widget-row-selection.model';

describe('TableWidgetRowSelectionModel applies to current row depth', () => {
  test('works for default properties', () => {
    const model = new TableWidgetRowSelectionModel();
    model.handler = {
      execute: jest.fn()
    };

    expect(model.appliesToCurrentRowDepth(0)).toBeTruthy();
    // All higher depth should also be true
    expect(model.appliesToCurrentRowDepth(1)).toBeTruthy();
  });

  test('works for higher row depth', () => {
    const model = new TableWidgetRowSelectionModel();
    model.handler = {
      execute: jest.fn()
    };
    model.rowDepth = 2;

    expect(model.appliesToCurrentRowDepth(0)).toBeFalsy();
    expect(model.appliesToCurrentRowDepth(1)).toBeFalsy();
    expect(model.appliesToCurrentRowDepth(2)).toBeTruthy();
    expect(model.appliesToCurrentRowDepth(3)).toBeTruthy();
  });

  test('works correctly when applyToChildRows is false', () => {
    const model = new TableWidgetRowSelectionModel();
    model.handler = {
      execute: jest.fn()
    };
    model.rowDepth = 2;
    model.applyToChildRows = false;

    expect(model.appliesToCurrentRowDepth(0)).toBeFalsy();
    expect(model.appliesToCurrentRowDepth(1)).toBeFalsy();
    expect(model.appliesToCurrentRowDepth(2)).toBeTruthy();
    expect(model.appliesToCurrentRowDepth(3)).toBeFalsy();
  });
});
