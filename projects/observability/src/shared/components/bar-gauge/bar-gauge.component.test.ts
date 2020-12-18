import { fakeAsync } from '@angular/core/testing';
import { DomElementMeasurerService, FormattingModule } from '@hypertrace/common';
import { LoadAsyncModule } from '@hypertrace/components';
import { BarGaugeComponent } from '@hypertrace/observability';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { MockProvider } from 'ng-mocks';

describe('Bar Gauge component', () => {
  let spectator: Spectator<BarGaugeComponent>;

  const createHost = createHostFactory({
    component: BarGaugeComponent,
    shallow: true,
    imports: [FormattingModule, LoadAsyncModule],
    providers: [
      MockProvider(DomElementMeasurerService, {
        measureHtmlElement: (element: HTMLElement) => {
          switch (element.getAttribute('class')) {
            case 'segment-bar':
              return {
                bottom: 1,
                height: 1,
                left: 0,
                right: 33,
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
        }
      })
    ],
    template: `
      <ht-bar-gauge
        title="Test Title"
        [segments]="segments"
        [maxValue]="maxValue"
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
        maxValue: 100
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
  }));

  test('assigns correct values when near full', fakeAsync(() => {
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
  }));
});
