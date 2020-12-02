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
        'M-139.64240043768942,-2.3092638912203256e-14A10,10,0,0,1,-149.61685761181008,-10.714285714285738A150,150,0,0,1,149.61685761181008,-10.714285714285714A10,10,0,0,1,139.64240043768942,0L139.64240043768942,0A10,10,0,0,1,129.66794326356876,-9.285714285714285A130,130,0,0,0,-129.66794326356873,-9.2857142857143A10,10,0,0,1,-139.64240043768942,-2.3092638912203256e-14Z',
      origin: {
        x: 150,
        y: 170
      },
      radius: 150,
      data: {
        value: 80,
        maxValue: 100,
        valueArc:
          'M-139.64240043768942,-2.3092638912203256e-14A10,10,0,0,1,-149.61685761181008,-10.714285714285738A150,150,0,0,1,114.74488132122605,-96.61062162401063A10,10,0,0,1,112.97307508940239,-82.07974357199379L112.97307508940239,-82.07974357199379A10,10,0,0,1,99.44556381172924,-83.72920540747589A130,130,0,0,0,-129.66794326356873,-9.2857142857143A10,10,0,0,1,-139.64240043768942,-2.3092638912203256e-14Z',
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
