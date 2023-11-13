import { FixedTimeRange, NavigationParamsType, TimeRangeService } from '@hypertrace/common';
import { FilterBuilderLookupService, FilterOperator, toUrlFilterOperator } from '@hypertrace/components';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { AttributeMetadata, AttributeMetadataType } from '../../shared/graphql/model/metadata/attribute-metadata';
import { MetadataService } from '../../shared/services/metadata/metadata.service';
import { ExplorerService } from './explorer-service';
import { ScopeQueryParam } from './explorer.component';

describe('Explorer service', () => {
  const getAttributeMock = jest.fn((scope, attributeKey) =>
    of(
      attributeKey === 'duration'
        ? {
            name: 'duration',
            displayName: 'Duration',
            units: 'ms',
            type: AttributeMetadataType.Long,
            scope: scope,
            onlySupportsAggregation: false,
            onlySupportsGrouping: false,
            allowedAggregations: [],
            groupable: false,
          }
        : {
            name: 'status',
            displayName: 'Status',
            units: '',
            type: AttributeMetadataType.String,
            scope: scope,
            onlySupportsAggregation: false,
            onlySupportsGrouping: false,
            allowedAggregations: [],
            groupable: false,
          },
    ),
  );

  const lookupMock = jest.fn(() => ({
    buildFilter: (attribute: AttributeMetadata, operator: FilterOperator, value: number) => ({
      metadata: attribute,
      field: attribute.name,
      operator: operator,
      value: value,
      userString: '',
      urlString: `${attribute.name}${toUrlFilterOperator(operator)}${value}`,
    }),
  }));

  const createService = createServiceFactory({
    service: ExplorerService,
    providers: [
      mockProvider(FilterBuilderLookupService, { lookup: lookupMock }),
      mockProvider(MetadataService, { getAttribute: getAttributeMock }),
      mockProvider(TimeRangeService, {
        toQueryParams: () => ({
          ['time']: new FixedTimeRange(
            new Date('2019-09-19T16:40:45.141Z'),
            new Date('2019-09-19T16:55:45.141Z'),
          ).toUrlString(),
        }),
      }),
    ],
  });

  test('creates nav params correctly when timeRange is not provided', () => {
    runFakeRxjs(({ expectObservable }) => {
      const spectator = createService();
      expectObservable(
        spectator.service.buildNavParamsWithFilters(ScopeQueryParam.EndpointTraces, [
          { field: 'duration', operator: FilterOperator.GreaterThan, value: 200 },
          { field: 'status', operator: FilterOperator.Equals, value: 404 },
        ]),
      ).toBe('(x|)', {
        x: {
          navType: NavigationParamsType.InApp,
          path: '/explorer',
          queryParams: {
            filter: ['duration_gt_200', 'status_eq_404'],
            scope: ScopeQueryParam.EndpointTraces,
          },
        },
      });
    });
  });

  test('creates nav params correctly when timeRange is provided', () => {
    runFakeRxjs(({ expectObservable }) => {
      const spectator = createService();
      expectObservable(
        spectator.service.buildNavParamsWithFilters(
          ScopeQueryParam.EndpointTraces,
          [
            { field: 'duration', operator: FilterOperator.GreaterThan, value: 200 },
            { field: 'status', operator: FilterOperator.Equals, value: 404 },
          ],
          new FixedTimeRange(new Date('2019-09-19T16:40:45.141Z'), new Date('2019-09-19T16:55:45.141Z')),
        ),
      ).toBe('(x|)', {
        x: {
          navType: NavigationParamsType.InApp,
          path: '/explorer',
          queryParams: {
            filter: ['duration_gt_200', 'status_eq_404'],
            scope: ScopeQueryParam.EndpointTraces,
            ['time']: new FixedTimeRange(
              new Date('2019-09-19T16:40:45.141Z'),
              new Date('2019-09-19T16:55:45.141Z'),
            ).toUrlString(),
          },
        },
      });
    });
  });
});
