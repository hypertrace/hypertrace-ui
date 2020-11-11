import { Color } from '@hypertrace/common';
import { createModelFactory } from '@hypertrace/dashboards/testing';
import { MODEL_PROPERTY_TYPES } from '@hypertrace/hyperdash-angular';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { of } from 'rxjs';
import { GaugeWidgetData } from './gauge-widget';
import { GaugeWidgetModel } from './gauge-widget.model';

describe('Gauge widget model', () => {
  test('uses colors from color map', () => {
    const modelFactory = createModelFactory();

    const data: GaugeWidgetData = {
      value: 5,
      maxValue: 10,
      thresholds: [
        {
          start: 0,
          end: 6,
          label: 'Medium',
          color: Color.Brown1
        }
      ]
    };

    const spectator = modelFactory(GaugeWidgetModel, {
      api: {
        getData: () => of(data)
      },
      providers: [
        {
          provide: MODEL_PROPERTY_TYPES,
          useValue: []
        }
      ],
      properties: {
        title: 'Test Title'
      }
    });

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.model.getData()).toBe('(x|)', {
        x: {
          value: 5,
          maxValue: 10,
          thresholds: [
            {
              start: 0,
              end: 6,
              label: 'Medium',
              color: Color.Brown1
            }
          ]
        }
      });
    });
  });
});
