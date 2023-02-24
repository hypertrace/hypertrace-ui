import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync } from '@angular/core/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { DomElementMeasurerService, NavigationService, TimeUnit } from '@hypertrace/common';
import { mockDashboardWidgetProviders } from '@hypertrace/dashboards/testing';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { EntitiesGraphqlQueryBuilderService } from '../../../graphql/request/handlers/entities/query/entities-graphql-query-builder.service';
import { RadarWidgetDataFetcher } from './data/radar-data-source.model';
import { RadarWidgetRendererComponent } from './radar-widget-renderer.component';
import { ComparisonDuration } from './radar-widget.model';
import { RadarWidgetModule } from './radar-widget.module';

describe('Radar Widget renderer', () => {
  const comparisonDurations = [
    ComparisonDuration.PriorHour,
    ComparisonDuration.PriorDay,
    ComparisonDuration.PriorMonth
  ];
  let title = '';
  const dataHour = {
    current: [
      {
        axis: 'metric-1',
        value: 20
      },
      {
        axis: 'metric-2',
        value: 40
      }
    ],
    previous: [
      {
        axis: 'metric-1',
        value: 30
      },
      {
        axis: 'metric-2',
        value: 50
      }
    ]
  };

  const dataDay = {
    current: [
      {
        axis: 'metric-1',
        value: 20
      },
      {
        axis: 'metric-2',
        value: 40
      }
    ],
    previous: [
      {
        axis: 'metric-1',
        value: 50
      },
      {
        axis: 'metric-2',
        value: 90
      }
    ]
  };

  const dataMonth = {
    current: [
      {
        axis: 'metric-1',
        value: 20
      },
      {
        axis: 'metric-2',
        value: 40
      }
    ],
    previous: [
      {
        axis: 'metric-1',
        value: 90
      },
      {
        axis: 'metric-2',
        value: 100
      }
    ]
  };

  const mockResponse: RadarWidgetDataFetcher = {
    getData: timeDuration => {
      switch (timeDuration.unit) {
        default:
        case TimeUnit.Hour:
          return of(dataHour);
        case TimeUnit.Day:
          return of(dataDay);
        case TimeUnit.Month:
          return of(dataMonth);
      }
    }
  };

  const model = {
    getData: jest.fn(() => of(mockResponse)),
    title: title,
    comparisonDurations: comparisonDurations,
    currentSeries: {
      name: 'latency',
      color: 'blue'
    }
  };

  const createComponent = createComponentFactory<RadarWidgetRendererComponent>({
    component: RadarWidgetRendererComponent,
    providers: [
      ...mockDashboardWidgetProviders(model),
      mockProvider(EntitiesGraphqlQueryBuilderService),
      mockProvider(DomElementMeasurerService, {
        measureSvgElement: () => ({
          x: 0,
          y: 0,
          width: 0,
          height: 0
        }),
        getComputedTextLength: () => 0
      })
    ],
    mocks: [NavigationService],
    declareComponent: false,
    shallow: true,
    imports: [RadarWidgetModule, HttpClientTestingModule, IconLibraryTestingModule]
  });

  test('renders the widget for default duration selection', fakeAsync(() => {
    title = 'Radar';

    const spectator = createComponent();

    spectator.tick();

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.data$!).toBe('(x|)', {
        x: {
          axes: [
            {
              name: 'metric-1'
            },
            {
              name: 'metric-2'
            }
          ],
          series: [
            {
              color: '#bfd0d9',
              data: [
                {
                  axis: 'metric-1',
                  value: 30
                },
                {
                  axis: 'metric-2',
                  value: 50
                }
              ],
              name: 'Prior Hour',
              showPoints: false
            },
            {
              color: 'blue',
              data: [
                {
                  axis: 'metric-1',
                  value: 20
                },
                {
                  axis: 'metric-2',
                  value: 40
                }
              ],
              name: 'latency',
              showPoints: true
            }
          ]
        }
      });
    });

    const selectOptionElement = spectator.query('ht-select');
    expect(selectOptionElement).toExist();
  }));

  test('renders the widget for Prior day', fakeAsync(() => {
    title = 'Radar';

    const spectator = createComponent();
    spectator.component.onSelection(ComparisonDuration.PriorDay);
    spectator.tick();

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.data$!).toBe('(x|)', {
        x: {
          axes: [
            {
              name: 'metric-1'
            },
            {
              name: 'metric-2'
            }
          ],
          series: [
            {
              color: '#bfd0d9',
              data: [
                {
                  axis: 'metric-1',
                  value: 50
                },
                {
                  axis: 'metric-2',
                  value: 90
                }
              ],
              name: 'Prior Day',
              showPoints: false
            },
            {
              color: 'blue',
              data: [
                {
                  axis: 'metric-1',
                  value: 20
                },
                {
                  axis: 'metric-2',
                  value: 40
                }
              ],
              name: 'latency',
              showPoints: true
            }
          ]
        }
      });
    });
  }));

  test('renders the widget for Prior month', fakeAsync(() => {
    title = 'Radar';

    const spectator = createComponent();
    spectator.component.onSelection(ComparisonDuration.PriorMonth);
    spectator.tick();

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.data$!).toBe('(x|)', {
        x: {
          axes: [
            {
              name: 'metric-1'
            },
            {
              name: 'metric-2'
            }
          ],
          series: [
            {
              color: '#bfd0d9',
              data: [
                {
                  axis: 'metric-1',
                  value: 90
                },
                {
                  axis: 'metric-2',
                  value: 100
                }
              ],
              name: 'Prior Month',
              showPoints: false
            },
            {
              color: 'blue',
              data: [
                {
                  axis: 'metric-1',
                  value: 20
                },
                {
                  axis: 'metric-2',
                  value: 40
                }
              ],
              name: 'latency',
              showPoints: true
            }
          ]
        }
      });
    });
  }));
});
