import { Color, DomElementMeasurerService } from '@hypertrace/common';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { GaugeComponent } from './gauge.component';

describe('Gauge component', () => {
  let spectator: Spectator<GaugeComponent>;

  const createHost = createHostFactory({
    component: GaugeComponent,
    shallow: true,
    providers: [
      mockProvider(DomElementMeasurerService, {
        measureHtmlElement: jest.fn().mockReturnValue({
          height: 200,
          width: 300,
          bottom: 0,
          left: 0,
          right: 0,
          top: 0
        })
      })
    ]
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
      backgroundArc:
        'M-137.45365478341216,36.83059579592157A7.5,7.5,0,0,1,-146.73136591755903,31.143317998687955A150,150,0,1,1,146.73136591755903,31.143317998687948A7.5,7.5,0,0,1,137.45365478341216,36.83059579592157L137.45365478341216,36.83059579592157A7.5,7.5,0,0,1,132.05822932580313,28.02898619881916A135,135,0,1,0,-132.05822932580313,28.02898619881914A7.5,7.5,0,0,1,-137.45365478341216,36.83059579592157Z',
      origin: {
        x: 150,
        y: 150
      },
      radius: 150,
      data: {
        value: 80,
        maxValue: 100,
        valueArc:
          'M-137.45365478341216,36.83059579592157A7.5,7.5,0,0,1,-146.73136591755903,31.143317998687955A150,150,0,0,1,88.13185990085536,-121.37864421065183A7.5,7.5,0,0,1,89.55386161673987,-110.58980906724544L89.55386161673987,-110.58980906724544A7.5,7.5,0,0,1,79.31867391076982,-109.24077978958663A135,135,0,0,0,-132.05822932580313,28.02898619881914A7.5,7.5,0,0,1,-137.45365478341216,36.83059579592157Z',
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
