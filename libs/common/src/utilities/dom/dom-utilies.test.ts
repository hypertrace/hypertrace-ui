import { selector, selectorAny, SelectorType, unionOfClientRects } from './dom-utilities';

describe('Dom Utilities', () => {
  test('should convert a selector based on type', () => {
    // Class selector
    expect(selector('class1')).toEqual('.class1');
    expect(selector('class1', SelectorType.Class)).toEqual('.class1');
    // Element selector
    expect(selector('element1', SelectorType.Element)).toEqual('element1');
    // Attribute selector
    expect(selector('attribute1', SelectorType.Attribute)).toEqual('[attribute1]');
  });

  test('should convert a list of class selectors', () => {
    expect(selectorAny('class1', 'class2', 'class3')).toEqual('.class1,.class2,.class3');
  });

  test('should convert to union of client rects', () => {
    const clientRect1: ClientRect = {
      left: 20,
      right: 40,
      top: 10,
      bottom: 40,
      height: 30,
      width: 20
    };

    const clientRect2: ClientRect = {
      left: 0,
      right: 45,
      top: 5,
      bottom: 55,
      height: 50,
      width: 45
    };

    expect(unionOfClientRects(clientRect1, clientRect2)).toEqual({
      left: 0,
      right: 45,
      top: 5,
      bottom: 55,
      height: 50,
      width: 45
    });
  });
});
