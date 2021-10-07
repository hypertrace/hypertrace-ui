import { SpecificationBuilder } from './specification-builder';

describe('Specification Builder', () => {
  const specBuilder = new SpecificationBuilder();
  test("attribute specs replace 'null' strings with undefined", () => {
    expect(
      specBuilder.attributeSpecificationForKey('test').extractFromServerData({
        test: 'null'
      })
    ).toBeUndefined();
  });

  test('field specs should build correct selection and response', () => {
    const fieldSpec = specBuilder.fieldSpecificationForKey('test');

    expect(fieldSpec.resultAlias()).toEqual('test');
    expect(fieldSpec.name).toEqual('test');

    expect(fieldSpec.asGraphQlSelections()).toEqual({ path: 'test' });
    expect(fieldSpec.extractFromServerData({ test: 'null' })).toBeUndefined();

    expect(fieldSpec.extractFromServerData({ test: 'test value' })).toEqual('test value');

    expect(fieldSpec.asGraphQlOrderByFragment()).toEqual({ key: 'test' });
  });
});
