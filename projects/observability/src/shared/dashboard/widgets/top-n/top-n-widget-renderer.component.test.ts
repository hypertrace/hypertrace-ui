import { FormattingModule, NavigationService } from '@hypertrace/common';
import { LoadAsyncModule, TitledContentComponent } from '@hypertrace/components';
import { mockDashboardWidgetProviders } from '@hypertrace/dashboards/testing';
import { MetricAggregationType } from '@hypertrace/distributed-tracing';
import { ExploreSpecificationBuilder } from '@hypertrace/observability';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../graphql/model/schema/entity';
import { EntityNavigationService } from '../../../services/navigation/entity/entity-navigation.service';
import { TopNWidgetDataFetcher } from './data/top-n-data-source.model';
import { TopNExploreSelectionSpecificationModel } from './data/top-n-explore-selection-specification.model';
import { TopNWidgetRendererComponent } from './top-n-widget-renderer.component';

describe('Top N Widget renderer', () => {
  let mockResponse: TopNWidgetDataFetcher;
  let optionMetricSpecifications: TopNExploreSelectionSpecificationModel[] = [];

  const createComponent = createComponentFactory<TopNWidgetRendererComponent>({
    component: TopNWidgetRendererComponent,
    providers: [
      mockProvider(EntityNavigationService, {
        navigateToEntity: jest.fn()
      })
    ],
    mocks: [NavigationService],
    imports: [FormattingModule, LoadAsyncModule],
    declarations: [MockComponent(TitledContentComponent)],
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
    topNOptionSpec.metric = exploreSpecBuilder.exploreSpecificationForKey(metricName, aggregationType);
    topNOptionSpec.metric.displayName = displayName;
    topNOptionSpec.context = 'API_CONTEXT';

    return topNOptionSpec;
  };

  test('renders the widget with sorted data', () => {
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

    const mockModel = {
      getData: jest.fn(() => of(mockResponse)),
      header: {
        title: 'Top Apis'
      }
    };

    const spectator = createComponent({
      providers: [...mockDashboardWidgetProviders(mockModel)]
    });

    expect(spectator.query(TitledContentComponent)!.title).toEqual('TOP APIS');

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.data$!).toBe('(x|)', {
        x: [
          {
            label: 'Api 2',
            value: 100,
            entity: {
              [entityIdKey]: 'test-id - 2',
              [entityTypeKey]: ObservabilityEntityType.Api
            }
          },
          {
            label: 'Api 1',
            value: 50,
            entity: {
              [entityIdKey]: 'test-id - 1',
              [entityTypeKey]: ObservabilityEntityType.Api
            }
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
      getData: () => of(data),
      getOptions: () => optionMetricSpecifications
    };

    const mockModel = {
      getData: jest.fn(() => of(mockResponse)),
      header: {
        title: ''
      }
    };

    const spectator = createComponent({
      providers: [...mockDashboardWidgetProviders(mockModel)]
    });
    spectator.component.data$?.subscribe();
    spectator.component.onItemClicked(data[0]);

    expect(spectator.inject(EntityNavigationService).navigateToEntity).toHaveBeenCalledWith({
      [entityIdKey]: 'test-id - 2',
      [entityTypeKey]: ObservabilityEntityType.Api
    });
  });
});
