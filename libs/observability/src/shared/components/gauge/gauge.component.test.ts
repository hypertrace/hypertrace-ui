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

  test('render data from thresholds', () => {
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
          'M-137.45365478341216,36.83059579592157A7.5,7.5,0,0,1,-146.73136591755903,31.143317998687955A150,150,0,0,1,129.88160257335298,-75.03845222935763A7.5,7.5,0,0,1,126.79245119273195,-64.60398068647702L126.79245119273195,-64.60398068647702A7.5,7.5,0,0,1,116.8934423160177,-67.5346070064219A135,135,0,0,0,-132.05822932580313,28.02898619881914A7.5,7.5,0,0,1,-137.45365478341216,36.83059579592157Z',
        color: '#9e4c41',
        label: 'Medium'
      }
    });
  });

  test('render data from default values', () => {
    spectator = createHost(
      `<ht-gauge [value]="value" [maxValue]="maxValue" [defaultColor]="defaultColor" [defaultLabel]="defaultLabel"></ht-gauge>`,
      {
        hostProps: {
          value: 80,
          maxValue: 100,
          defaultColor: '#9e4c41',
          defaultLabel: 'Medium'
        }
      }
    );
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
          'M-137.45365478341216,36.83059579592157A7.5,7.5,0,0,1,-146.73136591755903,31.143317998687955A150,150,0,0,1,129.88160257335298,-75.03845222935763A7.5,7.5,0,0,1,126.79245119273195,-64.60398068647702L126.79245119273195,-64.60398068647702A7.5,7.5,0,0,1,116.8934423160177,-67.5346070064219A135,135,0,0,0,-132.05822932580313,28.02898619881914A7.5,7.5,0,0,1,-137.45365478341216,36.83059579592157Z',
        color: '#9e4c41',
        label: 'Medium'
      }
    });
  });

  test('render data without default values or thresholds', () => {
    spectator = createHost(`<ht-gauge [value]="value" [maxValue]="maxValue"></ht-gauge>`, {
      hostProps: {
        value: 80,
        maxValue: 100
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
          'M-137.45365478341216,36.83059579592157A7.5,7.5,0,0,1,-146.73136591755903,31.143317998687955A150,150,0,0,1,129.88160257335298,-75.03845222935763A7.5,7.5,0,0,1,126.79245119273195,-64.60398068647702L126.79245119273195,-64.60398068647702A7.5,7.5,0,0,1,116.8934423160177,-67.5346070064219A135,135,0,0,0,-132.05822932580313,28.02898619881914A7.5,7.5,0,0,1,-137.45365478341216,36.83059579592157Z',
        color: Color.Blue5,
        label: ''
      }
    });
  });

  test('no render data when values are undefined', () => {
    spectator = createHost(`<ht-gauge></ht-gauge>`);
    spectator.component.onLayoutChange();
    expect(spectator.component.rendererData).toBeUndefined();
  });
});
