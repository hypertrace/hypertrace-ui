import { FormattingModule, NavigationService } from '@hypertrace/common';
import { TitledContentComponent } from '@hypertrace/components';
import { MetricAggregationType } from '@hypertrace/distributed-tracing';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { RENDERER_API } from '@hypertrace/hyperdash-angular';
import { ExploreSpecificationBuilder } from '@hypertrace/observability';
import { getMockFlexLayoutProviders, runFakeRxjs } from '@hypertrace/test-utils';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { EMPTY, of } from 'rxjs';
import { TopNChartComponent } from '../../../components/top-n/top-n-chart.component';
import { entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../graphql/model/schema/entity';
import { EntityNavigationService } from '../../../services/navigation/entity/entity-navigation.service';
import { TopNWidgetDataFetcher } from './data/top-n-data-source.model';
import { TopNExploreSelectionSpecificationModel } from './data/top-n-explore-selection-specification.model';
import { TopNWidgetRendererComponent } from './top-n-widget-renderer.component';

describe('Top N Widget renderer', () => {
  let mockResponse: TopNWidgetDataFetcher;
  let optionMetricSpecifications: TopNExploreSelectionSpecificationModel[] = [];
  let title = '';

  const rendererApiFactory = () => ({
    getTimeRange: jest.fn(),
    model: {
      getData: jest.fn(() => of(mockResponse)),
      header: {
        title: title
      }
    },
    change$: EMPTY,
    dataRefresh$: EMPTY,
    timeRangeChanged$: EMPTY
  });

  const createComponent = createComponentFactory<TopNWidgetRendererComponent>({
    component: TopNWidgetRendererComponent,
    providers: [
      {
        provide: RENDERER_API,
        useFactory: rendererApiFactory
      },
      mockProvider(GraphQlRequestService, {
        queryImmediately: () => EMPTY
      }),
      mockProvider(EntityNavigationService, {
        navigateToEntity: jest.fn()
      }),
      ...getMockFlexLayoutProviders()
    ],
    mocks: [NavigationService],
    imports: [FormattingModule],
    declarations: [MockComponent(TopNChartComponent), MockComponent(TitledContentComponent)],
    shallow: true
  });

  const buildMetricSpecification = (
    displayName: string,
    metricName: string,
    aggregationType: MetricAggregationType
  ) => {
    const exploreSpecBuilder = new ExploreSpecificationBuilder();
    const topNOptionSpec = new TopNExploreSelectionSpecificationModel();
    topNOptionSpec.nameKey = 'nameKey';
    topNOptionSpec.idKey = 'idKey';
    topNOptionSpec.exploreSpec = exploreSpecBuilder.exploreSpecificationForKey(metricName, aggregationType);
    topNOptionSpec.exploreSpec.displayName = displayName;
    topNOptionSpec.context = 'API_CONTEXT';

    return topNOptionSpec;
  };

  test('renders the widget', () => {
    const data = [
      {
        label: 'Api 1',
        value: 50,
        entity: {
          [entityIdKey]: 'test-id - 1',
          [entityTypeKey]: ObservabilityEntityType.Api
        }
      },
      {
        label: 'Api 2',
        value: 100,
        entity: {
          [entityIdKey]: 'test-id - 2',
          [entityTypeKey]: ObservabilityEntityType.Api
        }
      }
    ];
    const requestMetricSpec = buildMetricSpecification('Request', 'numCalls', MetricAggregationType.Sum);
    const errorMetricSpec = buildMetricSpecification('Errors', 'errorCount', MetricAggregationType.Sum);
    requestMetricSpec.context = ObservabilityEntityType.Api;
    errorMetricSpec.context = ObservabilityEntityType.Api;
    optionMetricSpecifications = [requestMetricSpec, errorMetricSpec];
    mockResponse = {
      getData: () => of(data),
      getOptions: () => optionMetricSpecifications
    };

    title = 'Top Apis';

    const spectator = createComponent();
    expect(spectator.query(TitledContentComponent)!.title).toEqual('TOP APIS');

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.data$!).toBe('(x|)', {
        x: data
      });
      expectObservable(spectator.component.options$).toBe('(x|)', {
        x: [
          {
            label: 'Request',
            value: requestMetricSpec
          },
          {
            label: 'Errors',
            value: errorMetricSpec
          }
        ]
      });
    });
  });

  test('Handles on Click', () => {
    const data = [
      {
        label: 'Api 1',
        value: 50,
        entity: {
          [entityIdKey]: 'test-id - 1',
          [entityTypeKey]: ObservabilityEntityType.Api
        }
      },
      {
        label: 'Api 2',
        value: 100,
        entity: {
          [entityIdKey]: 'test-id - 2',
          [entityTypeKey]: ObservabilityEntityType.Api
        }
      }
    ];

    mockResponse = {
      getData: () => of(data),
      getOptions: () => optionMetricSpecifications
    };

    const spectator = createComponent();
    spectator.component.data$?.subscribe();
    spectator.component.onItemClicked(data[0]);

    expect(spectator.inject(EntityNavigationService).navigateToEntity).toHaveBeenCalledWith({
      [entityIdKey]: 'test-id - 1',
      [entityTypeKey]: ObservabilityEntityType.Api
    });
  });
});
