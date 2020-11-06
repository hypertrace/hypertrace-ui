import { Color } from '@hypertrace/common';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { GaugeComponent } from './gauge.component';
import { GaugeModule } from './gauge.module';

describe('Gauge component', () => {
  let spectator: Spectator<GaugeComponent>;

  const createHost = createHostFactory({
    component: GaugeComponent,
    declareComponent: false,
    imports: [GaugeModule]
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

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.gaugeRendererData$).toBe('200ms (x)', {
        x: {
          backgroundArc: 'M0,0Z',
          origin: {
            x: 0,
            y: 0
          },
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
        }
      });
    });
  });
});
