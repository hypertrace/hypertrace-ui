import { HttpClientTestingModule } from '@angular/common/http/testing';
import { discardPeriodicTasks, fakeAsync } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import {
  DEFAULT_COLOR_PALETTE,
  LayoutChangeService,
  NavigationService,
  RelativeTimeRange,
  TimeDuration,
  TimeRangeService,
  TimeUnit
} from '@hypertrace/common';
import {
  FilterAttributeType,
  FilterBarComponent,
  FilterBuilderLookupService,
  FilterOperator
} from '@hypertrace/components';
import {
  GraphQlFieldFilter,
  GraphQlOperatorType,
  MetadataService,
  MetricAggregationType,
  SPANS_GQL_REQUEST,
  SPAN_SCOPE,
  TRACES_GQL_REQUEST
} from '@hypertrace/distributed-tracing';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { getMockFlexLayoutProviders, patchRouterNavigateForTest } from '@hypertrace/test-utils';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { EMPTY, NEVER, of } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { CartesianSeriesVisualizationType } from '../../shared/components/cartesian/chart';
import { ExploreQueryEditorComponent } from '../../shared/components/explore-query-editor/explore-query-editor.component';
import { ObservabilityTraceType } from '../../shared/graphql/model/schema/observability-traces';
import { ExploreSpecificationBuilder } from '../../shared/graphql/request/builders/specification/explore/explore-specification-builder';
import { EntitiesGraphqlQueryBuilderService } from '../../shared/graphql/request/handlers/entities/query/entities-graphql-query-builder.service';
import { EXPLORE_GQL_REQUEST } from '../../shared/graphql/request/handlers/explore/explore-graphql-query-handler.service';
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
    spectator.tick(200); // Query emits async, tick here triggers building the DOM for the query
    discardPeriodicTasks(); // Some of the newly instantiated components also uses async, need to wait for them to settle
    spectator.tick(200);
  };

  const init = (...params: Parameters<typeof createComponent>) => {
    spectator = createComponent(...params);
    spectator.tick();
    patchRouterNavigateForTest(spectator);
    detectQueryChange();
    querySpy = spectator.inject(GraphQlRequestService).query;
  };

  test('fires query on init for traces', fakeAsync(() => {
    init({
      providers: [
        mockProvider(GraphQlRequestService, {
          query: jest.fn().mockReturnValueOnce(of(mockAttributes)).mockReturnValue(EMPTY)
        })
      ]
    });
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

    expect(querySpy).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        requestType: TRACES_GQL_REQUEST,
        filters: [],
        limit: 100
      }),
      expect.objectContaining({})
    );
  }));

  test('fires query on filter change for traces', fakeAsync(() => {
    init({
      providers: [
        mockProvider(GraphQlRequestService, {
          query: jest.fn().mockReturnValueOnce(of(mockAttributes)).mockReturnValue(EMPTY)
        })
      ]
    });
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
        filters: [new GraphQlFieldFilter('first', GraphQlOperatorType.Equals, 'foo')],
        limit: 1000,
        interval: new TimeDuration(15, TimeUnit.Second)
      }),
      expect.objectContaining({})
    );

    expect(querySpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        requestType: TRACES_GQL_REQUEST,
        filters: [new GraphQlFieldFilter('first', GraphQlOperatorType.Equals, 'foo')],
        limit: 100
      }),
      expect.objectContaining({})
    );
  }));

  test('fires query on init for spans', fakeAsync(() => {
    init({
      providers: [
        mockProvider(GraphQlRequestService, {
          query: jest.fn().mockReturnValueOnce(of(mockAttributes)).mockReturnValue(EMPTY)
        })
      ]
    });
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
    init({
      providers: [
        mockProvider(GraphQlRequestService, {
          query: jest.fn().mockReturnValueOnce(of(mockAttributes)).mockReturnValue(EMPTY)
        })
      ]
    });
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
        filters: [new GraphQlFieldFilter('first', GraphQlOperatorType.Equals, 'foo')]
      }),
      expect.objectContaining({})
    );

    expect(querySpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        requestType: SPANS_GQL_REQUEST,
        limit: 100,
        filters: [new GraphQlFieldFilter('first', GraphQlOperatorType.Equals, 'foo')]
      }),
      expect.objectContaining({})
    );
  }));

  test('traces table fires query on series change', fakeAsync(() => {
    init({
      providers: [
        mockProvider(GraphQlRequestService, {
          query: jest.fn().mockReturnValueOnce(of(mockAttributes)).mockReturnValue(EMPTY)
        })
      ]
    });
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
    init({
      providers: [
        mockProvider(GraphQlRequestService, {
          query: jest.fn().mockReturnValueOnce(of(mockAttributes)).mockReturnValue(EMPTY)
        })
      ]
    });
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

  test('updates URL with query param when context toggled', fakeAsync(() => {
    init();
    const queryParamChangeSpy = spyOn(spectator.inject(NavigationService), 'addQueryParametersToUrl');
    // Select Spans tab
    spectator.click(spectator.queryAll('ht-toggle-item')[1]);
    detectQueryChange();
    expect(queryParamChangeSpy).toHaveBeenLastCalledWith(expect.objectContaining({ scope: 'spans' }));

    // Select Endpoint traces tab
    spectator.click(spectator.queryAll('ht-toggle-item')[0]);
    detectQueryChange();
    expect(queryParamChangeSpy).toHaveBeenLastCalledWith(expect.objectContaining({ scope: 'endpoint-traces' }));
  }));

  test('selects tab based on url', fakeAsync(() => {
    init({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({ scope: 'spans' }))
          }
        }
      ]
    });
    expect(spectator.component.context).toBe(SPAN_SCOPE);
  }));

  test('defaults to endpoints and sets url', fakeAsync(() => {
    init({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({}))
          }
        }
      ]
    });
    expect(spectator.component.context).toBe(ObservabilityTraceType.Api);
    expect(spectator.inject(NavigationService).getQueryParameter('scope', 'unset')).toEqual('endpoint-traces');
  }));
});
