import { displayStringEnum } from './display-string-enum';

describe('Display string enum', () => {
  const enum TestEnum {
    Flat = 'flatcase',
    UpperFlat = 'UPPERFLATCASE',
    Camel = 'camelCase',
    Pascal = 'PascalCase',
    Snake = 'snake_case',
    PascalSnake = 'Pascal_Snake_Case',
    Kabob = 'kabob-case',
    Train = 'Train-Case',
    Macro = 'MACRO_CASE',
    MacroTrain = 'MACRO-TRAIN-CASE'
  }

  test('can convert to display string', () => {
    expect(displayStringEnum(undefined)).toBe('-');
    expect(displayStringEnum('a')).toBe('A');
    expect(displayStringEnum(TestEnum.Flat)).toBe('Flatcase');
    expect(displayStringEnum(TestEnum.UpperFlat)).toBe('Upperflatcase');
    expect(displayStringEnum(TestEnum.Camel)).toBe('Camel case');
    expect(displayStringEnum(TestEnum.Pascal)).toBe('Pascal case');
    expect(displayStringEnum(TestEnum.Snake)).toBe('Snake case');
    expect(displayStringEnum(TestEnum.PascalSnake)).toBe('Pascal snake case');
    expect(displayStringEnum(TestEnum.Kabob)).toBe('Kabob case');
    expect(displayStringEnum(TestEnum.Train)).toBe('Train case');
    expect(displayStringEnum(TestEnum.Macro)).toBe('Macro case');
    expect(displayStringEnum(TestEnum.MacroTrain)).toBe('Macro train case');
  });
});
