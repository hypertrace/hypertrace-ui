import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import {
  FormattingModule,
  IntervalDurationService,
  MemoizeModule,
  RecursivePartial,
  TimeDuration,
  TimeRangeService,
  TimeUnit
} from '@hypertrace/common';
import { LoadAsyncModule } from '@hypertrace/components';
import { TimeDurationModel } from '@hypertrace/dashboards';
import { mockDashboardWidgetProviders } from '@hypertrace/dashboards/testing';
import { ModelApi } from '@hypertrace/hyperdash';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { CartesianSeriesVisualizationType } from '../../../../components/cartesian/chart';
import { CartesianSelectedData } from '../../../../components/cartesian/chart-interactivty';
import { CartesianWidgetRendererComponent } from './cartesian-widget-renderer.component';
import { CartesianWidgetModel } from './cartesian-widget.model';
import { MetricSeriesDataFetcher, SeriesModel } from './series.model';

describe('Cartesian widget renderer component', () => {
  const selectedData: CartesianSelectedData<unknown> = {
    timeRange: TimeRangeService.toFixedTimeRange(
      new Date('2021-11-02T05:33:19.288Z'),
      new Date('2021-11-02T14:30:15.141Z')
    ),
    selectedData: [
      {
        dataPoint: { timestamp: '2021-11-02T05:40:00.000Z', value: 1477.3599999999983 },
        context: {
          data: [
            { timestamp: '2021-11-02T05:15:00.000Z', value: 774 },
            { timestamp: '2021-11-02T05:40:00.000Z', value: 1477.3599999999983 },
            { timestamp: '2021-11-02T12:05:00.000Z', value: 1056.48 }
          ],
          units: 'ms',
          color: '#4b5f77',
          name: 'p99',
          type: CartesianSeriesVisualizationType.Column,
          stacking: false,
          hide: false
        },
        location: { x: 59, y: 31.023400000000215 }
      },
      {
        dataPoint: { timestamp: '2021-11-02T12:05:00.000Z', value: 1056.48 },
        context: {
          data: [
            { timestamp: '2021-11-02T05:15:00.000Z', value: 774 },
            { timestamp: '2021-11-02T05:40:00.000Z', value: 1477.3599999999983 },
            { timestamp: '2021-11-02T12:05:00.000Z', value: 1056.48 }
          ],
          units: 'ms',
          color: '#4b5f77',
          name: 'p99',
          type: CartesianSeriesVisualizationType.Column,
          stacking: false,
          hide: false
        },
        location: { x: 138, y: 82.58120000000001 }
      }
    ],
    location: { x: 452, y: 763 }
  };

  const buildComponent = createComponentFactory({
    component: CartesianWidgetRendererComponent,
    providers: [
      mockProvider(IntervalDurationService, {
        getAvailableIntervalsForTimeRange: () => [
          new TimeDuration(1, TimeUnit.Minute),
          new TimeDuration(3, TimeUnit.Minute),
          new TimeDuration(1, TimeUnit.Hour)
        ],
        getExactMatch: (duration: TimeDuration, availableDurations: TimeDuration[]): TimeDuration | undefined =>
          availableDurations.find(availableDuration => duration.equals(availableDuration))
      })
    ],
    imports: [LoadAsyncModule, HttpClientTestingModule, IconLibraryTestingModule, FormattingModule, MemoizeModule],
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

  const fetcherFactory = (data: [number, number][]): MetricSeriesDataFetcher<[number, number]> => ({
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
      series: [seriesFactory({}, fetcherFactory([])), seriesFactory({}, fetcherFactory([]))]
    });
    const spectator = buildComponent({
      providers: [...mockDashboardWidgetProviders(mockModel)]
    });
    expect(spectator.component.selectedInterval).toEqual('AUTO');
  });

  test('sets default interval to use with selectable interval options', () => {
    const mockTimeDurationModel = new TimeDurationModel();
    mockTimeDurationModel.value = 1;
    mockTimeDurationModel.unit = TimeUnit.Hour;

    const mockModel = cartesianModelFactory({
      defaultInterval: mockTimeDurationModel,
      series: [seriesFactory({}, fetcherFactory([])), seriesFactory({}, fetcherFactory([]))]
    });
    const spectator = buildComponent({
      providers: [...mockDashboardWidgetProviders(mockModel)]
    });

    expect(spectator.component.selectedInterval).toEqual(expect.objectContaining({ value: 1, unit: TimeUnit.Hour }));
  });

  test('sets default interval without any interval selector options', () => {
    const mockTimeDurationModel = new TimeDurationModel();
    mockTimeDurationModel.value = 3;
    mockTimeDurationModel.unit = TimeUnit.Minute;

    const mockModel = cartesianModelFactory({
      defaultInterval: mockTimeDurationModel,
      selectableInterval: false,
      series: [seriesFactory({}, fetcherFactory([])), seriesFactory({}, fetcherFactory([]))]
    });
    const spectator = buildComponent({
      providers: [...mockDashboardWidgetProviders(mockModel)]
    });

    expect(spectator.component.selectedInterval).toEqual(expect.objectContaining({ value: 3, unit: TimeUnit.Minute }));
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
      new TimeDuration(3, TimeUnit.Minute),
      new TimeDuration(1, TimeUnit.Hour)
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

  test('calls selection handler on selection change', () => {
    const fetcher = fetcherFactory([]);
    const series = seriesFactory({}, fetcher);
    const mockModel = cartesianModelFactory({
      series: [series],
      maxSeriesDataPoints: 20,
      selectionHandler: {
        execute: jest.fn()
      }
    });
    const spectator = buildComponent({
      providers: [...mockDashboardWidgetProviders(mockModel)]
    });

    spectator.component.onSelectionChange(selectedData);

    expect(spectator.component.model.selectionHandler?.execute).toHaveBeenCalled();
  });
});
