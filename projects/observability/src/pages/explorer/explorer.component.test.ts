import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Provider } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import {
  DEFAULT_COLOR_PALETTE,
  FeatureStateResolver,
  LayoutChangeService,
  NavigationService,
  PreferenceService,
  RelativeTimeRange,
  TimeDuration,
  TimeRangeService,
  TimeUnit
} from '@hypertrace/common';
import {
  FilterAttributeType,
  FilterBarComponent,
  FilterBuilderLookupService,
  FilterOperator,
  ToggleGroupComponent
} from '@hypertrace/components';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { getMockFlexLayoutProviders, patchRouterNavigateForTest } from '@hypertrace/test-utils';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { EMPTY, NEVER, of } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { CartesianSeriesVisualizationType } from '../../shared/components/cartesian/chart';
import { ExploreQueryEditorComponent } from '../../shared/components/explore-query-editor/explore-query-editor.component';
import { ExploreQueryGroupByEditorComponent } from '../../shared/components/explore-query-editor/group-by/explore-query-group-by-editor.component';
import { ExploreQueryIntervalEditorComponent } from '../../shared/components/explore-query-editor/interval/explore-query-interval-editor.component';
import { ExploreQueryLimitEditorComponent } from '../../shared/components/explore-query-editor/limit/explore-query-limit-editor.component';
import { ExploreQuerySeriesEditorComponent } from '../../shared/components/explore-query-editor/series/explore-query-series-editor.component';
import { MetricAggregationType } from '../../shared/graphql/model/metrics/metric-aggregation';
import { GraphQlFieldFilter } from '../../shared/graphql/model/schema/filter/field/graphql-field-filter';
import { GraphQlOperatorType } from '../../shared/graphql/model/schema/filter/graphql-filter';
import { ObservabilityTraceType } from '../../shared/graphql/model/schema/observability-traces';
import { SPAN_SCOPE } from '../../shared/graphql/model/schema/span';
import { ExploreSpecificationBuilder } from '../../shared/graphql/request/builders/specification/explore/explore-specification-builder';
import { EntitiesGraphqlQueryBuilderService } from '../../shared/graphql/request/handlers/entities/query/entities-graphql-query-builder.service';
import { EXPLORE_GQL_REQUEST } from '../../shared/graphql/request/handlers/explore/explore-query';
import { SPANS_GQL_REQUEST } from '../../shared/graphql/request/handlers/spans/spans-graphql-query-handler.service';
import { TRACES_GQL_REQUEST } from '../../shared/graphql/request/handlers/traces/traces-graphql-query-handler.service';
import { MetadataService } from '../../shared/services/metadata/metadata.service';
import { ExplorerDashboardBuilder } from './explorer-dashboard-builder';
import { ExplorerComponent } from './explorer.component';
import { ExplorerModule } from './explorer.module';

describe('Explorer component', () => {
  let spectator: Spectator<ExplorerComponent>;
  let querySpy: jest.Mock;

  const mockAttributes = [
    {
      name: 'first',
      displayName: 'First',
      allowedAggregations: [],
      type: FilterAttributeType.String
    },
    {
      name: 'second',
      displayName: 'Second',
      allowedAggregations: [],
      type: FilterAttributeType.Timestamp
    }
  ];
  const testTimeRange = new RelativeTimeRange(new TimeDuration(15, TimeUnit.Minute));
  const createComponent = createComponentFactory({
    component: ExplorerComponent,
    imports: [
      ExplorerModule.withDashboardBuilderFactory({
        useFactory: (metadataService: MetadataService, filterBuilderLookupService: FilterBuilderLookupService) =>
          new ExplorerDashboardBuilder(metadataService, filterBuilderLookupService),
        deps: [MetadataService, FilterBuilderLookupService]
      }),
      ExplorerModule,
      RouterTestingModule,
      HttpClientTestingModule,
      IconLibraryTestingModule
    ],
    declareComponent: false,
    componentProviders: [LayoutChangeService],
    providers: [
      mockProvider(GraphQlRequestService, {
        query: jest.fn().mockReturnValueOnce(of(mockAttributes)).mockReturnValue(EMPTY)
      }),
      mockProvider(FeatureStateResolver, {
        getFeatureState: jest.fn().mockReturnValue(of(true))
      }),
      mockProvider(TimeRangeService, {
        getCurrentTimeRange: () => testTimeRange,
        getTimeRangeAndChanges: () => NEVER.pipe(startWith(testTimeRange))
      }),
      mockProvider(EntitiesGraphqlQueryBuilderService),
      {
        provide: ActivatedRoute,
        useValue: {
          queryParamMap: EMPTY
        }
      },
      {
        provide: DEFAULT_COLOR_PALETTE,
        useValue: {
          name: 'default',
          colors: ['black', 'white']
        }
      },
      mockProvider(PreferenceService, {
        get: jest.fn().mockReturnValue(of(true))
      }),
      ...getMockFlexLayoutProviders()
    ]
  });

  const buildSeries = (key: string, aggregation?: MetricAggregationType) => ({
    specification: new ExploreSpecificationBuilder().exploreSpecificationForKey(key, aggregation),
    visualizationOptions: {
      type: CartesianSeriesVisualizationType.Column
    }
  });

  const detectQueryChange = () => {
    spectator.detectChanges(); // Detect whatever caused the change
    spectator.tick(50); // Query emits async, tick here triggers building the DOM for the query
    // Break up the ticks into multiple to account for various async handoffs
    spectator.tick();
    spectator.tick(100);
  };

  const init = (...mockProviders: Provider[]) => {
    spectator = createComponent({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({}))
          }
        },
        ...mockProviders
      ]
    });
    spectator.tick();
    patchRouterNavigateForTest(spectator);
    detectQueryChange();
    querySpy = spectator.inject(GraphQlRequestService).query;
  };

  test('fires query on init for traces', fakeAsync(() => {
    init(
      mockProvider(GraphQlRequestService, {
        query: jest.fn().mockReturnValueOnce(of(mockAttributes)).mockReturnValue(EMPTY)
      })
    );

    // Traces tab is auto selected
    expect(querySpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        requestType: EXPLORE_GQL_REQUEST,
        context: ObservabilityTraceType.Api,
        limit: 1000,
        interval: new TimeDuration(15, TimeUnit.Second)
      }),
      expect.objectContaining({})
    );

    // RunFakeRxjs(({ expectObservable }) => {
    //   ExpectObservable(spectator.component.resultsDashboard$).toBe('x', { x: undefined });
    // });
    expect(querySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        requestType: TRACES_GQL_REQUEST,
        filters: [],
        limit: 100
      }),
      expect.objectContaining({})
    );
  }));

  test('fires query on filter change for traces', fakeAsync(() => {
    init(
      mockProvider(GraphQlRequestService, {
        query: jest.fn().mockReturnValueOnce(of(mockAttributes)).mockReturnValue(EMPTY)
      })
    );
    const filterBar = spectator.query(FilterBarComponent)!;

    // tslint:disable-next-line: no-object-literal-type-assertion
    filterBar.filtersChange.emit([
      {
        metadata: mockAttributes[0],
        field: mockAttributes[0].name,
        operator: FilterOperator.Equals,
        value: 'foo',
        userString: '',
        urlString: ''
      }
    ]);
    querySpy.mockClear();

    detectQueryChange();
    // Spans tab is auto selected
    expect(querySpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        requestType: EXPLORE_GQL_REQUEST,
        context: ObservabilityTraceType.Api,
        filters: [new GraphQlFieldFilter({ key: 'first' }, GraphQlOperatorType.Equals, 'foo')],
        limit: 1000,
        interval: new TimeDuration(15, TimeUnit.Second)
      }),
      expect.objectContaining({})
    );

    expect(querySpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        requestType: TRACES_GQL_REQUEST,
        filters: [new GraphQlFieldFilter({ key: 'first' }, GraphQlOperatorType.Equals, 'foo')],
        limit: 100
      }),
      expect.objectContaining({})
    );
  }));

  test('fires query on init for spans', fakeAsync(() => {
    init(
      mockProvider(GraphQlRequestService, {
        query: jest.fn().mockReturnValueOnce(of(mockAttributes)).mockReturnValue(EMPTY)
      })
    );
    querySpy.mockClear();

    // Select Spans tab
    spectator.click(spectator.queryAll('ht-toggle-item')[1]);
    detectQueryChange();

    expect(querySpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        requestType: EXPLORE_GQL_REQUEST,
        context: SPAN_SCOPE,
        limit: 1000,
        interval: new TimeDuration(15, TimeUnit.Second)
      }),
      expect.objectContaining({})
    );

    expect(querySpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        requestType: SPANS_GQL_REQUEST,
        filters: [],
        limit: 100
      }),
      expect.objectContaining({})
    );
  }));

  test('fires query on init for traces', fakeAsync(() => {
    init(
      mockProvider(GraphQlRequestService, {
        query: jest.fn().mockReturnValueOnce(of(mockAttributes)).mockReturnValue(EMPTY)
      })
    );
    // Select traces tab
    spectator.click(spectator.queryAll('ht-toggle-item')[1]);
    detectQueryChange();

    querySpy.mockClear();

    const filterBar = spectator.query(FilterBarComponent)!;

    // tslint:disable-next-line: no-object-literal-type-assertion
    filterBar.filtersChange.emit([
      {
        metadata: mockAttributes[0],
        field: mockAttributes[0].name,
        operator: FilterOperator.Equals,
        value: 'foo',
        userString: '',
        urlString: ''
      }
    ]);
    detectQueryChange();

    // Traces tab is auto selected
    expect(querySpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        requestType: EXPLORE_GQL_REQUEST,
        context: SPAN_SCOPE,
        limit: 1000,
        interval: new TimeDuration(15, TimeUnit.Second),
        filters: [new GraphQlFieldFilter({ key: 'first' }, GraphQlOperatorType.Equals, 'foo')]
      }),
      expect.objectContaining({})
    );

    expect(querySpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        requestType: SPANS_GQL_REQUEST,
        limit: 100,
        filters: [new GraphQlFieldFilter({ key: 'first' }, GraphQlOperatorType.Equals, 'foo')]
      }),
      expect.objectContaining({})
    );
  }));

  test('traces table fires query on series change', fakeAsync(() => {
    init(
      mockProvider(GraphQlRequestService, {
        query: jest.fn().mockReturnValueOnce(of(mockAttributes)).mockReturnValue(EMPTY)
      })
    );
    spectator.query(ExploreQueryEditorComponent)!.setSeries([buildSeries('second', MetricAggregationType.Average)]);

    detectQueryChange();
    expect(querySpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        requestType: EXPLORE_GQL_REQUEST,
        selections: expect.arrayContaining([
          expect.objectContaining({
            name: 'second'
          })
        ])
      }),
      undefined
    );
  }));

  test('visualization fires query on series change', fakeAsync(() => {
    init(
      mockProvider(GraphQlRequestService, {
        query: jest.fn().mockReturnValueOnce(of(mockAttributes)).mockReturnValue(EMPTY)
      })
    );
    querySpy.mockClear();

    spectator.query(ExploreQueryEditorComponent)!.setSeries([buildSeries('second', MetricAggregationType.Average)]);

    detectQueryChange();
    expect(querySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        requestType: EXPLORE_GQL_REQUEST,
        selections: expect.arrayContaining([
          expect.objectContaining({
            name: 'second'
          })
        ])
      }),
      undefined
    );
  }));

  test('updates URL with query param when query updated', fakeAsync(() => {
    init();
    const queryParamChangeSpy = spyOn(spectator.inject(NavigationService), 'addQueryParametersToUrl');
    spectator.click(spectator.queryAll('ht-toggle-item')[1]);
    spectator.query(ExploreQueryEditorComponent)!.setSeries([buildSeries('second', MetricAggregationType.Average)]);
    spectator.query(ExploreQueryEditorComponent)!.setInterval(new TimeDuration(30, TimeUnit.Second));
    spectator.query(ExploreQueryEditorComponent)!.updateGroupByExpression(
      {
        keyExpressions: [{ key: 'apiName' }],
        limit: 6,
        includeRest: true
      },
      { key: 'apiName' }
    );
    detectQueryChange();
    expect(queryParamChangeSpy).toHaveBeenLastCalledWith({
      scope: 'spans',
      series: ['column:avg(second)'],
      group: ['apiName'],
      limit: 6,
      other: true,
      interval: '30s'
    });
  }));

  test('sets state based on url', fakeAsync(() => {
    init({
      provide: ActivatedRoute,
      useValue: {
        queryParamMap: of(
          convertToParamMap({
            scope: 'spans',
            series: 'line:distinct_count(apiName)',
            group: 'apiName',
            limit: '6',
            other: 'true',
            interval: '30s'
          })
        )
      }
    });
    expect(spectator.query(ToggleGroupComponent)?.activeItem?.label).toBe('Spans');
    expect(spectator.query(ExploreQueryGroupByEditorComponent)?.groupByExpression).toEqual({ key: 'apiName' });
    expect(spectator.query(ExploreQueryLimitEditorComponent)?.limit).toBe(6);
    expect(spectator.query(ExploreQueryLimitEditorComponent)?.includeRest).toBe(true);
    expect(spectator.query(ExploreQuerySeriesEditorComponent)?.series).toEqual({
      specification: expect.objectContaining({
        aggregation: MetricAggregationType.DistinctCount,
        name: 'apiName'
      }),
      visualizationOptions: { type: CartesianSeriesVisualizationType.Line }
    });
    expect(spectator.query(ExploreQueryIntervalEditorComponent)?.interval).toEqual(
      new TimeDuration(30, TimeUnit.Second)
    );
  }));
});
