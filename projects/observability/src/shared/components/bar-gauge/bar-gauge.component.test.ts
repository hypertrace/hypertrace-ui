import { fakeAsync } from '@angular/core/testing';
import { ColorService, DomElementMeasurerService, FormattingModule } from '@hypertrace/common';
import { LoadAsyncModule } from '@hypertrace/components';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { MockProvider } from 'ng-mocks';
import { BarGaugeComponent } from './bar-gauge.component';

describe('Bar Gauge component', () => {
  let spectator: Spectator<BarGaugeComponent>;

  const setMeasureHtmlElement = (right: number = 33): ((element: HTMLElement) => ClientRect) => (
    element: HTMLElement
  ) => {
    switch (element.getAttribute('class')) {
      case 'segment-bar':
        return {
          bottom: 1,
          height: 1,
          left: 0,
          right: right,
          top: 0,
          width: 33
        };
      case 'max-value-bar':
      default:
        return {
          bottom: 1,
          height: 1,
          left: 0,
          right: 100,
          top: 0,
          width: 100
        };
    }
  };

  const createHost = createHostFactory({
    component: BarGaugeComponent,
    shallow: true,
    imports: [FormattingModule, LoadAsyncModule],
    providers: [
      MockProvider(DomElementMeasurerService, {
        measureHtmlElement: setMeasureHtmlElement(33)
      }),
      mockProvider(ColorService, {
        getColorPalette: () => ({
          forNColors: () => ['first-color', 'second-color', 'third-color']
        })
      })
    ],
    template: `
      <ht-bar-gauge
        title="Test Title"
        [segments]="segments"
        [maxValue]="maxValue"
        [isUnlimited]="isUnlimited"
      ></ht-bar-gauge>
    `
  });

  test('assigns correct values when not full', fakeAsync(() => {
    spectator = createHost(undefined, {
      hostProps: {
        segments: [
          {
            value: 33,
            color: 'red',
            label: 'test-segment-red'
          },
          {
            value: 33,
            color: 'yellow',
            label: 'test-segment-yellow'
          }
        ],
        maxValue: 100,
        isUnlimited: false
      }
    });
    spectator.tick();

    expect(spectator.component.nearMaxValue).toEqual(false);
    expect(spectator.component.overMaxValue).toEqual(false);
    expect(spectator.component.totalValue).toEqual(66);
    expect(spectator.component.barSegments).toEqual([
      {
        color: 'red',
        label: 'test-segment-red',
        percentage: 33,
        value: 33
      },
      {
        color: 'yellow',
        label: 'test-segment-yellow',
        percentage: 33,
        value: 33
      }
    ]);
    expect(spectator.component.isUnlimited).toEqual(false);
  }));

  test('assigns correct values when near full', fakeAsync(() => {
    spectator = createHost(undefined, {
      providers: [
        MockProvider(DomElementMeasurerService, {
          measureHtmlElement: setMeasureHtmlElement(99)
        })
      ],
      hostProps: {
        segments: [
          {
            value: 33,
            color: 'red',
            label: 'test-segment-red'
          },
          {
            value: 33,
            color: 'yellow',
            label: 'test-segment-yellow'
          },
          {
            value: 33,
            color: 'green',
            label: 'test-segment-green'
          }
        ],
        maxValue: 100
      }
    });
    spectator.tick();

    expect(spectator.component.nearMaxValue).toEqual(true);
    expect(spectator.component.overMaxValue).toEqual(false);
    expect(spectator.component.totalValue).toEqual(99);
    expect(spectator.component.barSegments).toEqual([
      {
        color: 'red',
        label: 'test-segment-red',
        percentage: 33,
        value: 33
      },
      {
        color: 'yellow',
        label: 'test-segment-yellow',
        percentage: 33,
        value: 33
      },
      {
        color: 'green',
        label: 'test-segment-green',
        percentage: 33,
        value: 33
      }
    ]);
  }));

  test('assigns correct values when over full', fakeAsync(() => {
    spectator = createHost(undefined, {
      providers: [
        MockProvider(DomElementMeasurerService, {
          measureHtmlElement: setMeasureHtmlElement(100)
        })
      ],
      hostProps: {
        segments: [
          {
            value: 33,
            color: 'red',
            label: 'test-segment-red'
          },
          {
            value: 33,
            color: 'yellow',
            label: 'test-segment-yellow'
          },
          {
            value: 33,
            color: 'green',
            label: 'test-segment-green'
          },
          {
            value: 33,
            color: 'blue',
            label: 'test-segment-blue'
          }
        ],
        maxValue: 100
      }
    });
    spectator.tick();

    expect(spectator.component.nearMaxValue).toEqual(true);
    expect(spectator.component.overMaxValue).toEqual(true);
    expect(spectator.component.totalValue).toEqual(132);
    expect(spectator.component.barSegments).toEqual([
      {
        color: 'red',
        label: 'test-segment-red',
        percentage: 33,
        value: 33
      },
      {
        color: 'yellow',
        label: 'test-segment-yellow',
        percentage: 33,
        value: 33
      },
      {
        color: 'green',
        label: 'test-segment-green',
        percentage: 33,
        value: 33
      },
      {
        color: 'blue',
        label: 'test-segment-blue',
        percentage: 33,
        value: 33
      }
    ]);
    expect(spectator.query('.unlimited-symbol')).not.toExist();
  }));

  test('should display unlimited value', fakeAsync(() => {
    spectator = createHost(undefined, {
      providers: [
        MockProvider(DomElementMeasurerService, {
          measureHtmlElement: setMeasureHtmlElement(100)
        })
      ],
      hostProps: {
        segments: [
          {
            value: 100,
            color: 'red',
            label: 'test-segment-red'
          }
        ],
        maxValue: 100,
        isUnlimited: true
      }
    });
    spectator.tick();
    expect(spectator.component.totalValue).toEqual(100);
    expect(spectator.component.barSegments).toEqual([
      {
        value: 100,
        color: 'red',
        percentage: 100,
        label: 'test-segment-red'
      }
    ]);
    expect(spectator.query('.unlimited-symbol')).toExist();
  }));
});
