import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import {
  FormattingModule,
  IntervalDurationService,
  RecursivePartial,
  TimeDuration,
  TimeUnit
} from '@hypertrace/common';
import { LoadAsyncModule } from '@hypertrace/components';
import { mockDashboardWidgetProviders } from '@hypertrace/dashboards/testing';
import { ModelApi } from '@hypertrace/hyperdash';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { CartesianSeriesVisualizationType } from '../../../../components/cartesian/chart';
import { CartesianWidgetRendererComponent } from './cartesian-widget-renderer.component';
import { CartesianWidgetModel } from './cartesian-widget.model';
import { MetricSeriesDataFetcher, SeriesModel } from './series.model';

describe('Cartesian widget renderer component', () => {
  const buildComponent = createComponentFactory({
    component: CartesianWidgetRendererComponent,
    providers: [
      mockProvider(IntervalDurationService, {
        getAvailableIntervalsForTimeRange: () => [
          new TimeDuration(1, TimeUnit.Minute),
          new TimeDuration(3, TimeUnit.Minute)
        ],
        getExactMatch: (duration: TimeDuration, availableDurations: TimeDuration[]): TimeDuration | undefined =>
          availableDurations.find(availableDuration => duration.equals(availableDuration))
      })
    ],
    imports: [LoadAsyncModule, HttpClientTestingModule, IconLibraryTestingModule, FormattingModule],
    shallow: true
  });

  const seriesFactory = (
    seriesPartial: Partial<SeriesModel<[number, number]>>,
    fetcher: MetricSeriesDataFetcher<[number, number]>
  ): SeriesModel<[number, number]> => {
    const series = new SeriesModel<[number, number]>();
    Object.assign(series, seriesPartial);
    // tslint:disable-next-line: no-object-literal-type-assertion
    const mockApi = {
      getData: () => of(fetcher)
    } as ModelApi;
    series.api = mockApi;

    return series;
  };

  const fetcherFactory = (
    data: [number, number][]
  ): MetricSeriesDataFetcher<[number, number]> => ({
    getData: jest.fn(() =>
      of({
        intervals: data,
        units: 'ms'
      })
    )
  });

  const cartesianModelFactory = (
    cartesianPartial: RecursivePartial<CartesianWidgetModel<[number, number]>>
  ): CartesianWidgetModel<[number, number]> =>
    Object.assign(new CartesianWidgetModel<[number, number]>(), cartesianPartial);

  test('builds series with data', () => {
    const mockModel = cartesianModelFactory({
      series: [
        seriesFactory(
          {
            name: 'Series 1',
            color: 'blue'
          },
          fetcherFactory([
            [1, 2],
            [2, 4]
          ])
        ),
        seriesFactory(
          {
            name: 'Series 2',
            color: 'red'
          },
          fetcherFactory([
            [3, 5],
            [4, 6]
          ])
        )
      ]
    });
    const spectator = buildComponent({
      providers: [...mockDashboardWidgetProviders(mockModel)]
    });

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.data$!).toBe('(x|)', {
        x: {
          series: [
            {
              name: 'Series 1',
              color: 'blue',
              stacking: false,
              hide: false,
              type: CartesianSeriesVisualizationType.Area,
              units: 'ms',
              data: [
                [1, 2],
                [2, 4]
              ]
            },
            {
              name: 'Series 2',
              color: 'red',
              stacking: false,
              hide: false,
              type: CartesianSeriesVisualizationType.Area,
              units: 'ms',
              data: [
                [3, 5],
                [4, 6]
              ]
            }
          ],
          bands: []
        }
      });
    });
  });

  test('calculates correct interval to use', () => {
    const mockModel = cartesianModelFactory({
      series: [
        seriesFactory({}, fetcherFactory([])),
        seriesFactory({}, fetcherFactory([]))
      ]
    });
    const spectator = buildComponent({
      providers: [...mockDashboardWidgetProviders(mockModel)]
    });
    expect(spectator.component.selectedInterval).toEqual(new TimeDuration(3, TimeUnit.Minute));
  });

  test('provides expected interval options', () => {
    const mockModel = cartesianModelFactory({
      series: [seriesFactory({}, fetcherFactory([]))]
    });
    const spectator = buildComponent({
      providers: [...mockDashboardWidgetProviders(mockModel)]
    });
    expect(spectator.component.intervalOptions).toEqual([
      'AUTO',
      new TimeDuration(1, TimeUnit.Minute),
      new TimeDuration(3, TimeUnit.Minute)
    ]);
  });

  test('updates data on interval change', () => {
    const fetcher = fetcherFactory([]);
    const series = seriesFactory({}, fetcher);
    const mockModel = cartesianModelFactory({
      series: [series],
      maxSeriesDataPoints: 20
    });
    const spectator = buildComponent({
      providers: [...mockDashboardWidgetProviders(mockModel)]
    });
    const originalDataObservable = spectator.component.data$;
    spectator.component.onIntervalChange(new TimeDuration(3, TimeUnit.Minute));
    expect(fetcher.getData).toHaveBeenLastCalledWith(new TimeDuration(3, TimeUnit.Minute));
    expect(originalDataObservable).not.toBe(spectator.component.data$);
    spectator.component.onIntervalChange('AUTO');
    expect(fetcher.getData).toHaveBeenLastCalledWith(undefined);
  });
});
