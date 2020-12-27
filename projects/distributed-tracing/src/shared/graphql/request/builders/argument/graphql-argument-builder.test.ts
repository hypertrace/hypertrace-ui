import { GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { GraphQlFieldFilter } from '../../../model/schema/filter/field/graphql-field-filter';
import { GraphQlOperatorType } from '../../../model/schema/filter/graphql-filter';
import { GraphQlTimeRange } from '../../../model/schema/timerange/graphql-time-range';
import { SpecificationBuilder } from '../specification/specification-builder';
import { GraphQlArgumentBuilder } from './graphql-argument-builder';

describe('Graphql Argument Builder', () => {
  const argBuilder = new GraphQlArgumentBuilder();
  const specBuilder = new SpecificationBuilder();

  test('construct arguments for offset correctly', () => {
    expect(argBuilder.forOffset(undefined)).toEqual(expect.arrayContaining([]));
    expect(argBuilder.forOffset(1)).toEqual(expect.arrayContaining([{ name: 'offset', value: 1 }]));
  });

  test('construct arguments for attribute key correctly', () => {
    expect(argBuilder.forAttributeKey('test-key')).not.toEqual(
      expect.objectContaining({ name: 'key', value: 'test-key' })
    );
  });

  test('construct arguments for limit correctly', () => {
    expect(argBuilder.forLimit(1)).toEqual(expect.objectContaining({ name: 'limit', value: 1 }));
  });

  test('construct arguments for orderBy correctly', () => {
    expect(argBuilder.forOrderBy(undefined)).toEqual(expect.arrayContaining([]));
    expect(
      argBuilder.forOrderBy({ direction: 'ASC', key: specBuilder.attributeSpecificationForKey('test-key') })
    ).toEqual(expect.arrayContaining([{ name: 'orderBy', value: [{ direction: { value: 'ASC' }, key: 'test-key' }] }]));
  });

  test('construct arguments for orderBys correctly', () => {
    expect(argBuilder.forOrderBy(undefined)).toEqual(expect.arrayContaining([]));
    expect(
      argBuilder.forOrderBys([
        { direction: 'ASC', key: specBuilder.attributeSpecificationForKey('test-key') },
        { direction: 'ASC', key: specBuilder.attributeSpecificationForKey('test-key2') }
      ])
    ).toEqual(
      expect.arrayContaining([
        {
          name: 'orderBy',
          value: [
            { direction: { value: 'ASC' }, key: 'test-key' },
            { direction: { value: 'ASC' }, key: 'test-key2' }
          ]
        }
      ])
    );
  });

  test('construct arguments for time range correctly', () => {
    expect(argBuilder.forTimeRange(new GraphQlTimeRange(16000000, 16000000))).toEqual(
      expect.objectContaining({
        name: 'between',
        value: { endTime: new Date(16000000), startTime: new Date(16000000) }
      })
    );
  });

  test('construct arguments for ID correctly', () => {
    expect(argBuilder.forId('test-id')).toEqual(expect.objectContaining({ name: 'id', value: 'test-id' }));
  });

  test('construct arguments for trace type correctly', () => {
    expect(argBuilder.forTraceType('trace-type')).toEqual(
      expect.objectContaining({ name: 'type', value: new GraphQlEnumArgument('trace-type') })
    );
  });

  test('construct arguments for entity type correctly', () => {
    expect(argBuilder.forTraceType('entity-type')).toEqual(
      expect.objectContaining({ name: 'type', value: new GraphQlEnumArgument('entity-type') })
    );
  });

  test('construct arguments for filters correctly', () => {
    const filter = new GraphQlFieldFilter('filter-key', GraphQlOperatorType.Equals, 'filter-value');
    expect(argBuilder.forFilters([])).toEqual(expect.arrayContaining([]));
    expect(argBuilder.forFilters([filter])).toEqual(
      expect.arrayContaining([
        {
          name: 'filterBy',
          value: [
            { key: 'filter-key', operator: { value: 'EQUALS' }, type: { value: 'ATTRIBUTE' }, value: 'filter-value' }
          ]
        }
      ])
    );
  });
});
