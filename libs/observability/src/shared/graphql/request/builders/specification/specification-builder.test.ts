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

  test('Should extract server data with hyphenated attribute key ', () => {
    expect(
      specBuilder.attributeSpecificationForKey('test-non-word-character-attributes').extractFromServerData({
        test_non_word_character_attributes: {
          prop1: 'prop1'
        }
      })
    ).toEqual({
      prop1: 'prop1'
    });
  });
});
