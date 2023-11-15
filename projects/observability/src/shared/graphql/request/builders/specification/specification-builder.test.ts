import { SpecificationBuilder } from './specification-builder';

describe('Specification Builder', () => {
  const specBuilder = new SpecificationBuilder();
  test("attribute specs replace 'null' strings with undefined", () => {
    expect(
      specBuilder.attributeSpecificationForKey('test').extractFromServerData({
        test: 'null',
      }),
    ).toBeUndefined();
  });

  test('Should extract server data with hyphenated attribute key ', () => {
    expect(
      specBuilder.attributeSpecificationForKey('test-non-word-character-attributes').extractFromServerData({
        test_non_word_character_attributes: {
          prop1: 'prop1',
        },
      }),
    ).toEqual({
      prop1: 'prop1',
    });
  });

  test('Should extract server data for composite specifications ', () => {
    const idSpec = specBuilder.attributeSpecificationForKey('id');
    const nameSpec = specBuilder.attributeSpecificationForKey('name');
    const serverData = { id: 'test-id', name: 'test-name' };

    // For Specification Array
    expect(
      specBuilder.buildCompositeSpecification([idSpec, nameSpec], 'test').extractFromServerData(serverData),
    ).toMatchObject(['test-id', 'test-name']);

    // For Specifications Object
    expect(
      specBuilder
        .buildCompositeSpecification({ id1: idSpec, name1: nameSpec }, 'test')
        .extractFromServerData(serverData),
    ).toMatchObject({ id1: 'test-id', name1: 'test-name' });
  });
});
