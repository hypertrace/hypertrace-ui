import { FilterBuilderLookupService } from '@hypertrace/components';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { Observable, of, throwError } from 'rxjs';
import { AttributeMetadataType } from '../../graphql/model/metadata/attribute-metadata';
import { MetricAggregationType } from '../../graphql/model/metrics/metric-aggregation';
import { SPAN_SCOPE } from '../../graphql/model/schema/span';
import { Specification } from '../../graphql/model/schema/specifier/specification';
import { SpecificationBuilder } from '../../graphql/request/builders/specification/specification-builder';
import { MetadataService } from './metadata.service';

describe('Metadata Service', () => {
  const testAttributes = [
    {
      name: 'attr1',
      displayName: 'Attribute 1',
      units: 'ms',
      type: AttributeMetadataType.String,
      scope: 'Scope1',
      allowedAggregations: [],
      onlySupportsAggregation: false,
      onlySupportsGrouping: false,
      groupable: true
    },
    {
      name: 'attr2',
      displayName: 'Attribute 2',
      units: 'ms',
      type: AttributeMetadataType.Number,
      scope: SPAN_SCOPE,
      allowedAggregations: [MetricAggregationType.Average, MetricAggregationType.Sum],
      onlySupportsAggregation: false,
      onlySupportsGrouping: false,
      groupable: false
    },
    {
      name: 'attr3',
      displayName: 'Attribute 3',
      units: '',
      type: AttributeMetadataType.Number,
      scope: SPAN_SCOPE,
      allowedAggregations: [],
      onlySupportsAggregation: false,
      onlySupportsGrouping: false,
      groupable: false
    },
    {
      name: 'attr4',
      displayName: 'Attribute 4',
      units: '',
      type: 'UNKNOWN_TYPE',
      scope: SPAN_SCOPE,
      allowedAggregations: [],
      onlySupportsAggregation: false,
      onlySupportsGrouping: false,
      groupable: false
    }
  ];
  const specBuilder = new SpecificationBuilder();
  const createService = createServiceFactory({
    service: MetadataService,
    providers: [
      mockProvider(GraphQlRequestService, {
        query: jest.fn().mockReturnValue(of(testAttributes))
      }),
      mockProvider(FilterBuilderLookupService, {
        isBuildableType: (type: AttributeMetadataType) =>
          type === AttributeMetadataType.String || type === AttributeMetadataType.Number
      })
    ]
  });

  const expectSingleValueObservable = <T>(observable: Observable<T>, value: T): void => {
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(observable).toBe('(x|)', { x: value });
    });
  };

  test('caches attribute response', () => {
    const spectator = createService();
    expectSingleValueObservable(spectator.service.getFilterAttributes('Scope1'), [testAttributes[0]]);
    expectSingleValueObservable(spectator.service.getFilterAttributes('Scope1'), [testAttributes[0]]);
    expect(spectator.inject(GraphQlRequestService).query).toHaveBeenCalledTimes(1);
  });

  test('returns empty array if server response is error', () => {
    const spectator = createService({
      providers: [
        mockProvider(GraphQlRequestService, {
          query: jest.fn().mockReturnValue(throwError('error'))
        })
      ]
    });
    expectSingleValueObservable(spectator.service.getFilterAttributes('Scope1'), []);
  });

  test('calculates display name for attribute', () => {
    const spectator = createService();
    expectSingleValueObservable(
      spectator.service.getSpecificationDisplayName('Scope1', specBuilder.attributeSpecificationForKey('attr1')),
      'Attribute 1'
    );
  });

  test('calculates display name for metric aggregation', () => {
    const spectator = createService();
    expectSingleValueObservable(
      // tslint:disable-next-line: no-object-literal-type-assertion
      spectator.service.getSpecificationDisplayName('Scope1', {
        ...specBuilder.attributeSpecificationForKey('attr1'),
        aggregation: MetricAggregationType.Max
      } as Specification),
      'Max. Attribute 1'
    );

    expectSingleValueObservable(
      // tslint:disable-next-line: no-object-literal-type-assertion
      spectator.service.getSpecificationDisplayName('Scope1', {
        ...specBuilder.attributeSpecificationForKey('attr1'),
        aggregation: MetricAggregationType.AvgrateMinute
      } as Specification),
      'Attribute 1 Rate (min.)'
    );
  });

  test('defaults to use spec name if attribute not known', () => {
    const spectator = createService();
    expectSingleValueObservable(
      spectator.service.getSpecificationDisplayName('Scope1', specBuilder.attributeSpecificationForKey('attr_fake')),
      'attr_fake'
    );
  });

  test('returns only aggregatable attributes for selection', () => {
    const spectator = createService();

    expectSingleValueObservable(spectator.service.getSelectionAttributes('fake'), []);
    expectSingleValueObservable(spectator.service.getSelectionAttributes('other'), []);
    expectSingleValueObservable(spectator.service.getSelectionAttributes(SPAN_SCOPE), [
      expect.objectContaining({
        name: 'attr2',
        scope: SPAN_SCOPE
      })
    ]);
  });

  test('returns only groupable true attributes when requested', () => {
    const spectator = createService();

    expectSingleValueObservable(spectator.service.getGroupableAttributes(SPAN_SCOPE), []);
    expectSingleValueObservable(spectator.service.getGroupableAttributes('Scope1'), [
      expect.objectContaining({
        name: 'attr1',
        scope: 'Scope1'
      })
    ]);
    expectSingleValueObservable(spectator.service.getGroupableAttributes(SPAN_SCOPE), []);
  });

  test('should only return filterable attributes', () => {
    const spectator = createService();

    expectSingleValueObservable(spectator.service.getFilterAttributes(SPAN_SCOPE), [
      testAttributes[1],
      testAttributes[2]
    ]);
  });
});
