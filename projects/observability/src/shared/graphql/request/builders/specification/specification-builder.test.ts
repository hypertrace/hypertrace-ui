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
});
