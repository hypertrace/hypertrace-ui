import { fakeAsync, tick } from '@angular/core/testing';
import { NavigationParamsType } from '@hypertrace/common';
import {
  FilterAttributeType,
  FilterBuilderLookupService,
  FilterOperator,
  NumberFilterBuilder,
  StringFilterBuilder
} from '@hypertrace/components';
import { AttributeMetadataType, MetadataService } from '@hypertrace/distributed-tracing';
import { ExplorerService, ScopeQueryParam } from '@hypertrace/observability';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';

describe('Explorer service', () => {
  const createService = createServiceFactory({
    service: ExplorerService
  });

  const getAttributeMock = jest.fn((scope, attributeKey) =>
    of(
      attributeKey === 'duration'
        ? {
            name: 'duration',
            displayName: 'Duration',
            units: 'ms',
            type: AttributeMetadataType.Number,
            scope: scope,
            requiresAggregation: false,
            allowedAggregations: [],
            groupable: false
          }
        : {
            name: 'userIdentifier',
            displayName: 'User ID',
            units: '',
            type: AttributeMetadataType.String,
            scope: scope,
            requiresAggregation: false,
            allowedAggregations: [],
            groupable: false
          }
    )
  );

  const lookupMock = jest.fn(filterAttributeType =>
    filterAttributeType === FilterAttributeType.Number ? new NumberFilterBuilder() : new StringFilterBuilder()
  );

  test('creates nav params correctly', fakeAsync(() => {
    const spectator = createService({
      providers: [
        mockProvider(FilterBuilderLookupService, { lookup: lookupMock }),
        mockProvider(MetadataService, { getAttribute: getAttributeMock })
      ]
    });
    spectator.service
      .buildNavParamsWithFilters(ScopeQueryParam.EndpointTraces, [
        { field: 'duration', operator: FilterOperator.GreaterThan, value: 200 },
        { field: 'userIdentifier', operator: FilterOperator.Equals, value: 'test' }
      ])
      .subscribe(data =>
        expect(data).toEqual({
          navType: NavigationParamsType.InApp,
          path: '/explorer',
          queryParams: {
            filter: ['duration_gt_200', 'userIdentifier_eq_test'],
            scope: ScopeQueryParam.EndpointTraces
          }
        })
      );
    tick();
  }));
});
