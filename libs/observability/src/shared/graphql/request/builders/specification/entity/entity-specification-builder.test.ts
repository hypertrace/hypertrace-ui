import { entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../../model/schema/entity';
import { TraceStatusType } from '../../../../model/schema/trace';
import { TraceStatusSpecificationBuilder } from './../trace/trace-status/trace-status-specification-builder';
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
            name: 'expression',
            value: { key: 'id' }
          }
        ]
      },
      {
        path: 'attribute',
        alias: 'name',
        arguments: [
          {
            name: 'expression',
            value: { key: 'name' }
          }
        ]
      },
      {
        path: 'attribute',
        alias: 'attribute1',
        arguments: [
          {
            name: 'expression',
            value: { key: 'attribute1' }
          }
        ]
      },
      {
        path: 'attribute',
        alias: 'attribute2',
        arguments: [
          {
            name: 'expression',
            value: { key: 'attribute2' }
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

  test('correctly builds entity specification with explicit entity type and additional specification', () => {
    const traceSpec = new TraceStatusSpecificationBuilder().build();

    const entitySpec = entitySpecificationBuilder.build(
      'id',
      'name',
      ObservabilityEntityType.Api,
      ['attribute1', 'attribute2'],

      [traceSpec]
    );

    expect(entitySpec.asGraphQlSelections()).toEqual([
      {
        path: 'attribute',
        alias: 'id',
        arguments: [
          {
            name: 'expression',
            value: { key: 'id' }
          }
        ]
      },
      {
        path: 'attribute',
        alias: 'name',
        arguments: [
          {
            name: 'expression',
            value: { key: 'name' }
          }
        ]
      },
      {
        path: 'attribute',
        alias: 'attribute1',
        arguments: [
          {
            name: 'expression',
            value: { key: 'attribute1' }
          }
        ]
      },
      {
        path: 'attribute',
        alias: 'attribute2',
        arguments: [
          {
            name: 'expression',
            value: { key: 'attribute2' }
          }
        ]
      },
      {
        path: 'attribute',
        alias: 'status',
        arguments: [
          {
            name: 'expression',
            value: { key: 'status' }
          }
        ]
      },
      {
        path: 'attribute',
        alias: 'statusCode',
        arguments: [
          {
            name: 'expression',
            value: { key: 'statusCode' }
          }
        ]
      },
      {
        path: 'attribute',
        alias: 'statusMessage',
        arguments: [
          {
            name: 'expression',
            value: { key: 'statusMessage' }
          }
        ]
      }
    ]);

    expect(
      entitySpec.extractFromServerData({
        id: 'test-id',
        name: 'test-name',
        attribute1: 'test-value-attrib1',
        attribute2: 'test-value-attrib2',
        status: TraceStatusType.FAIL,
        statusCode: '404',
        statusMessage: 'Not Found'
      })
    ).toEqual({
      [entityIdKey]: 'test-id',
      [entityTypeKey]: ObservabilityEntityType.Api,
      name: 'test-name',
      attribute1: 'test-value-attrib1',
      attribute2: 'test-value-attrib2',
      [traceSpec.name]: {
        status: TraceStatusType.FAIL,
        statusCode: '404',
        statusMessage: 'Not Found'
      }
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
            name: 'expression',
            value: { key: 'id' }
          }
        ]
      },
      {
        path: 'attribute',
        alias: 'name',
        arguments: [
          {
            name: 'expression',
            value: { key: 'name' }
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
            name: 'expression',
            value: { key: 'id' }
          }
        ]
      },
      {
        path: 'attribute',
        alias: 'name',
        arguments: [
          {
            name: 'expression',
            value: { key: 'name' }
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
