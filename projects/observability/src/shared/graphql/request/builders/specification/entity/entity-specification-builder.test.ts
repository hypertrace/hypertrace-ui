import { entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../../model/schema/entity';
import { EntitySpecificationBuilder } from './entity-specification-builder';

describe('Entity Specification Builder', () => {
  const entitySpecificationBuilder = new EntitySpecificationBuilder();

  test('correctly builds entity specification with explicit entity type', () => {
    const entitySpec = entitySpecificationBuilder.build('id', 'name', ObservabilityEntityType.Api, [
      'attribute1',
      'attribute2'
    ]);

    expect(entitySpec.asGraphQlSelections()).toEqual([
      {
        path: 'attribute',
        alias: 'id',
        arguments: [
          {
            name: 'key',
            value: 'id'
          }
        ]
      },
      {
        path: 'attribute',
        alias: 'name',
        arguments: [
          {
            name: 'key',
            value: 'name'
          }
        ]
      },
      {
        path: 'attribute',
        alias: 'attribute1',
        arguments: [
          {
            name: 'key',
            value: 'attribute1'
          }
        ]
      },
      {
        path: 'attribute',
        alias: 'attribute2',
        arguments: [
          {
            name: 'key',
            value: 'attribute2'
          }
        ]
      }
    ]);

    expect(
      entitySpec.extractFromServerData({
        id: 'test-id',
        name: 'test-name',
        attribute1: 'test-value-attrib1',
        attribute2: 'test-value-attrib2'
      })
    ).toEqual({
      [entityIdKey]: 'test-id',
      [entityTypeKey]: ObservabilityEntityType.Api,
      name: 'test-name',
      attribute1: 'test-value-attrib1',
      attribute2: 'test-value-attrib2'
    });
  });

  test('correctly builds entity specification without entity type', () => {
    const entitySpec = entitySpecificationBuilder.build('id', 'name');

    expect(entitySpec.asGraphQlSelections()).toEqual([
      {
        path: 'attribute',
        alias: 'id',
        arguments: [
          {
            name: 'key',
            value: 'id'
          }
        ]
      },
      {
        path: 'attribute',
        alias: 'name',
        arguments: [
          {
            name: 'key',
            value: 'name'
          }
        ]
      },
      {
        path: 'type'
      }
    ]);

    expect(
      entitySpec.extractFromServerData({
        id: 'test-id',
        name: 'test-name',
        type: 'service'
      })
    ).toEqual({
      [entityIdKey]: 'test-id',
      [entityTypeKey]: ObservabilityEntityType.Service,
      name: 'test-name'
    });
  });

  test('throws exception if type cannot be determined', () => {
    const entitySpec = entitySpecificationBuilder.build('id', 'name');

    expect(entitySpec.asGraphQlSelections()).toEqual([
      {
        path: 'attribute',
        alias: 'id',
        arguments: [
          {
            name: 'key',
            value: 'id'
          }
        ]
      },
      {
        path: 'attribute',
        alias: 'name',
        arguments: [
          {
            name: 'key',
            value: 'name'
          }
        ]
      },
      {
        path: 'type'
      }
    ]);

    expect(() =>
      entitySpec.extractFromServerData({
        id: 'test-id',
        name: 'test-name'
      })
    ).toThrow();
  });
});
