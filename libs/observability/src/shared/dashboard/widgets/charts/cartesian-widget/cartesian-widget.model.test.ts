import { TimeDuration, TimeUnit } from '@hypertrace/common';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { of } from 'rxjs';
import { CartesianDataFetcher, CartesianWidgetModel } from './cartesian-widget.model';
import { SeriesModel } from './series.model';

describe('Cartesian Widget Model', () => {
  let model!: CartesianWidgetModel<[number, number]>;
  let dataFetcher: CartesianDataFetcher<[number, number]>;

  const buildMockSeries = (name: string, data: [number, number][]): SeriesModel<[number, number]> => {
    const series = new SeriesModel<[number, number]>();
    series.name = name;
    series.getDataFetcher = jest.fn().mockReturnValue(
      of({
        getData: () =>
          of({
            intervals: data
          })
      })
    );

    return series;
  };

  beforeEach(() => {
    model = new CartesianWidgetModel();

    model.series = [
      buildMockSeries('first', [
        [0, 10],
        [1, 15]
      ]),
      buildMockSeries('second', [
        [0, 20],
        [1, 25]
      ])
    ];
    model.getDataFetcher().subscribe(fetcher => (dataFetcher = fetcher));
  });

  test('correctly merges data fetcher', () => {
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(dataFetcher.getData(new TimeDuration(1, TimeUnit.Minute))).toBe('(x|)', {
        x: {
          series: [
            expect.objectContaining({
              data: [
                [0, 10],
                [1, 15]
              ],
              name: 'first'
            }),
            expect.objectContaining({
              data: [
                [0, 20],
                [1, 25]
              ],
              name: 'second'
            })
          ],
          bands: []
        }
      });
    });
  });
});
