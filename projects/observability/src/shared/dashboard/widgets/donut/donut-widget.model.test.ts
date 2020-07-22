import { createModelFactory } from '@hypertrace/dashboards/testing';
import { DonutSeriesResults} from '@hypertrace/observability';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { of } from 'rxjs';
import { DonutWidgetModel } from './donut-widget.model';
import { DEFAULT_COLOR_PALETTE } from '@hypertrace/common';
import { MODEL_PROPERTY_TYPES } from '@hypertrace/hyperdash-angular';

describe('Donut widget model', () => {
  test('uses colors from color map', () => {
    const modelFactory = createModelFactory();

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
        },
        {
          provide: MODEL_PROPERTY_TYPES,
          useValue: []
        }
      ]
    });

    spectator.model.colorPalette = [ 'red', 'blue'];

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.model.getData()).toBe('(x|)', {
        x: {
          "series": [
            {
              "color": "rgb(255, 0, 0)",
              "name": "first",
              "value": 10
            },
            {
              "color": "rgb(0, 0, 255)",
              "name": "second",
              "value": 20
            }
          ]
        }
      });
    });
  });
});
