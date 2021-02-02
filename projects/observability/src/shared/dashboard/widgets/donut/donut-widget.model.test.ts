import { DEFAULT_COLOR_PALETTE } from '@hypertrace/common';
import { createModelFactory } from '@hypertrace/dashboards/testing';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { of } from 'rxjs';
import { DonutSeriesResults } from '../../../components/donut/donut';
import { DonutWidgetModel } from './donut-widget.model';

describe('Donut widget model', () => {
  const modelFactory = createModelFactory();
  test('uses colors from color map', () => {
    const series: DonutSeriesResults = {
      series: [
        {
          name: 'first',
          value: 10
        },
        {
          name: 'second',
          value: 20
        }
      ],
      total: 2
    };

    const spectator = modelFactory(DonutWidgetModel, {
      api: {
        getData: () => of(series)
      },
      providers: [
        {
          provide: DEFAULT_COLOR_PALETTE,
          useValue: {
            name: 'default',
            colors: []
          }
        }
      ]
    });

    spectator.model.colorPalette = ['red', 'blue'];

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.model.getData()).toBe('(x|)', {
        x: {
          series: [
            {
              color: 'rgb(255, 0, 0)',
              name: 'first',
              value: 10
            },
            {
              color: 'rgb(0, 0, 255)',
              name: 'second',
              value: 20
            }
          ]
        }
      });
    });
  });
});
