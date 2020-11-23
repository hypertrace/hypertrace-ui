import { Color } from '@hypertrace/common';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { GaugeComponent } from './gauge.component';

describe('Gauge component', () => {
  let spectator: Spectator<GaugeComponent>;

  const createHost = createHostFactory({
    component: GaugeComponent,
    shallow: true
  });

  test('render all data', () => {
    spectator = createHost(`<ht-gauge [value]="value" [maxValue]="maxValue" [thresholds]="thresholds"></ht-gauge>`, {
      hostProps: {
        value: 80,
        maxValue: 100,
        thresholds: [
          {
            label: 'Medium',
            start: 60,
            end: 90,
            color: Color.Brown1
          },
          {
            label: 'High',
            start: 90,
            end: 100,
            color: Color.Red5
          }
        ]
      }
    });
    spectator.component.onLayoutChange();
    expect(spectator.component.rendererData).toEqual({
      backgroundArc: 'M0,0Z',
      origin: {
        x: 0,
        y: -30
      },
      radius: -30,
      data: {
        value: 80,
        maxValue: 100,
        valueArc: 'M0,0Z',
        threshold: {
          color: '#9e4c41',
          end: 90,
          label: 'Medium',
          start: 60
        }
      }
    });
  });
});
