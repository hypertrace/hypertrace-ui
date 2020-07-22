import { HttpClientTestingModule } from '@angular/common/http/testing';
import { discardPeriodicTasks, fakeAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
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
  AttributeMetadataType,
  FilterBarComponent,
  GraphQlFieldFilter,
  GraphQlOperatorType,
  MetadataService,
  MetricAggregationType,
  SPANS_GQL_REQUEST,
  SPAN_SCOPE,
  TRACES_GQL_REQUEST,
  UserFilterOperator
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
      type: AttributeMetadataType.String,
      requiresAggregation: false,
      scope: SPAN_SCOPE,
      units: ''
    },
    {
      name: 'second',
      displayName: 'Second',
      allowedAggregations: [],
      type: AttributeMetadataType.Timestamp,
      requiresAggregation: false,
      scope: SPAN_SCOPE,
      units: ''
    }
  ];
  const testTimeRange = new RelativeTimeRange(new TimeDuration(15, TimeUnit.Minute));
  const createComponent = createComponentFactory({
    component: ExplorerComponent,
    imports: [
      ExplorerModule.withDashboardBuilderFactory({
        useFactory: (metadataService: MetadataService) => new ExplorerDashboardBuilder(metadataService),
        deps: [MetadataService]
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
        queryImmediately: () => of(mockAttributes), // Only metadata uses queryImmediately in this test
        queryDebounced: jest.fn().mockReturnValue(EMPTY)
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
  };

  beforeEach(fakeAsync(() => {
    spectator = createComponent();
    patchRouterNavigateForTest(spectator);
    detectQueryChange();
    querySpy = spectator.inject(GraphQlRequestService).queryDebounced;
  }));

  test('fires query on init for traces', fakeAsync(() => {
    // Traces tab is auto selected
    expect(querySpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        requestType: EXPLORE_GQL_REQUEST,
        context: ObservabilityTraceType.Api,
        limit: 10000,
        interval: new TimeDuration(15, TimeUnit.Second)
      })
    );

    expect(querySpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        requestType: TRACES_GQL_REQUEST,
        filters: [],
        limit: 500
      })
    );
  }));

  test('fires query on filter change for traces', fakeAsync(() => {
    querySpy.mockClear();
    const filterBar = spectator.query(FilterBarComponent)!;

    // tslint:disable-next-line: no-object-literal-type-assertion
    filterBar.filtersChange.emit([
      {
        metadata: mockAttributes[0],
        field: mockAttributes[0].name,
        operator: UserFilterOperator.Equals,
        value: 'foo',
        userString: '',
        urlString: ''
      }
    ]);

    detectQueryChange();
    // Spans tab is auto selected
    expect(querySpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        requestType: EXPLORE_GQL_REQUEST,
        context: ObservabilityTraceType.Api,
        filters: [new GraphQlFieldFilter('first', GraphQlOperatorType.Equals, 'foo')],
        limit: 10000,
        interval: new TimeDuration(15, TimeUnit.Second)
      })
    );

    expect(querySpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        requestType: TRACES_GQL_REQUEST,
        filters: [new GraphQlFieldFilter('first', GraphQlOperatorType.Equals, 'foo')],
        limit: 500
      })
    );
  }));

  test('fires query on init for spans', fakeAsync(() => {
    querySpy.mockClear();

    // Select Spans tab
    spectator.click(spectator.queryAll('.htc-toggle-button')[1]);
    detectQueryChange();

    expect(querySpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        requestType: EXPLORE_GQL_REQUEST,
        context: SPAN_SCOPE,
        limit: 10000,
        interval: new TimeDuration(15, TimeUnit.Second)
      })
    );

    expect(querySpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        requestType: SPANS_GQL_REQUEST,
        filters: [],
        limit: 500
      })
    );
  }));

  test('fires query on init for spans', fakeAsync(() => {
    // Select traces tab
    spectator.click(spectator.queryAll('.htc-toggle-button')[1]);
    detectQueryChange();

    querySpy.mockClear();

    const filterBar = spectator.query(FilterBarComponent)!;

    // tslint:disable-next-line: no-object-literal-type-assertion
    filterBar.filtersChange.emit([
      {
        metadata: mockAttributes[0],
        field: mockAttributes[0].name,
        operator: UserFilterOperator.Equals,
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
        limit: 10000,
        interval: new TimeDuration(15, TimeUnit.Second),
        filters: [new GraphQlFieldFilter('first', GraphQlOperatorType.Equals, 'foo')]
      })
    );

    expect(querySpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        requestType: SPANS_GQL_REQUEST,
        limit: 500,
        filters: [new GraphQlFieldFilter('first', GraphQlOperatorType.Equals, 'foo')]
      })
    );
  }));

  test('traces table fires query on series change', fakeAsync(() => {
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
      })
    );
  }));

  test('visualization fires query on series change', fakeAsync(() => {
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
      })
    );
  }));

  test('updates URL with query param when context toggled', fakeAsync(() => {
    const queryParamChangeSpy = spyOn(spectator.inject(NavigationService), 'addQueryParametersToUrl');
    // Select Spans tab
    spectator.click(spectator.queryAll('.htc-toggle-button')[1]);
    detectQueryChange();
    expect(queryParamChangeSpy).toHaveBeenCalledWith(expect.objectContaining({ scope: 'spans' }));
  }));
});
