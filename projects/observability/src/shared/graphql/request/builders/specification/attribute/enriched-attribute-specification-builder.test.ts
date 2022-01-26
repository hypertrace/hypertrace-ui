import { EnrichedAttributeSpecificationBuilder } from './enriched-attribute-specification-builder';

describe('EnrichedAttributeSpecificationBuilder', () => {
  const specificationBuilder = new EnrichedAttributeSpecificationBuilder();

  test('correctly builds trace duration specification', () => {
    const specification = specificationBuilder.build('duration', 'ms');

    expect(specification.asGraphQlSelections()).toEqual({
      path: 'attribute',
      alias: 'duration',
      arguments: [
        {
          name: 'expression',
          value: { key: 'duration' }
        }
      ]
    });

    expect(
      specification.extractFromServerData({
        duration: 1
      })
    ).toEqual({
      value: 1,
      units: 'ms'
    });
  });
});
