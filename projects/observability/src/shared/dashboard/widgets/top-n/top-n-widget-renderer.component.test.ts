import { FormattingModule, NavigationService } from '@hypertrace/common';
import { TitledContentComponent } from '@hypertrace/components';
import { MetricAggregationType } from '@hypertrace/distributed-tracing';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { RENDERER_API } from '@hypertrace/hyperdash-angular';
import { getMockFlexLayoutProviders, runFakeRxjs } from '@hypertrace/test-utils';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { EMPTY, of } from 'rxjs';
import { TopNChartComponent } from '../../../components/top-n/top-n-chart.component';
import { entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../graphql/model/schema/entity';
import { EntityNavigationService } from '../../../services/navigation/entity/entity-navigation.service';
import { MetricAggregationSpecificationModel } from '../../data/graphql/specifiers/metric-aggregation-specification.model';
import { TopNWidgetDataFetcher } from './data/top-n-data-source.model';
import { TopNWidgetRendererComponent } from './top-n-widget-renderer.component';

describe('Top N Widget renderer', () => {
  let mockResponse: TopNWidgetDataFetcher;
  let optionMetricSpecifications: MetricAggregationSpecificationModel[] = [];
  let title = '';

  const rendererApiFactory = () => ({
    getTimeRange: jest.fn(),
    model: {
      getData: jest.fn(() => of(mockResponse)),
      header: {
        title: title
      },
      optionMetricSpecifications: optionMetricSpecifications
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
    const model = new MetricAggregationSpecificationModel();
    model.displayName = displayName;
    model.aggregation = aggregationType;
    model.metric = metricName;

    return model;
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
    mockResponse = {
      scope: ObservabilityEntityType.Api,
      getData: () => of(data)
    };
    const requestMetricSpec = buildMetricSpecification('Request', 'numCalls', MetricAggregationType.Sum);
    const errorMetricSpec = buildMetricSpecification('Errors', 'errorCount', MetricAggregationType.Sum);
    optionMetricSpecifications = [requestMetricSpec, errorMetricSpec];

    title = 'Top Apis';

    const spectator = createComponent();
    expect(spectator.query(TitledContentComponent)!.title).toEqual('TOP APIS');

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.data$!).toBe('(x|)', {
        x: [
          {
            label: 'Api 1',
            value: 50
          },
          {
            label: 'Api 2',
            value: 100
          }
        ]
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
      scope: ObservabilityEntityType.Api,
      getData: () => of(data)
    };

    const spectator = createComponent();
    spectator.component.data$?.subscribe();
    spectator.component.onLabelClicked('Api 1');

    expect(spectator.inject(EntityNavigationService).navigateToEntity).toHaveBeenCalledWith({
      [entityIdKey]: 'test-id - 1',
      [entityTypeKey]: ObservabilityEntityType.Api
    });
  });
});
