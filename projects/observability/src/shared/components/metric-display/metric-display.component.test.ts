import { MetricHealth } from '@hypertrace/distributed-tracing';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { MetricDisplayComponent } from './metric-display.component';
import { MetricDisplayModule } from './metric-display.module';

describe('Metric display component', () => {
  let spectator: Spectator<MetricDisplayComponent>;

  const createHost = createHostFactory({
    component: MetricDisplayComponent,
    imports: [MetricDisplayModule],
    declareComponent: false
  });

  test('shows provided title', () => {
    spectator = createHost(`<ht-metric-display [metricTitle]="title"></ht-metric-display>`, {
      hostProps: {
        title: 'Metric title'
      }
    });

    expect(spectator.query('.metric-title')).toHaveText('Metric title');
  });

  test('shows provided value and unit', () => {
    spectator = createHost(`<ht-metric-display [value]="value"></ht-metric-display>`, {
      hostProps: {
        value: '100'
      }
    });

    expect(spectator.query('.value')).toHaveText('100');
  });

  test('applies health class', () => {
    spectator = createHost(`<ht-metric-display [value]="value" [health]="health"></ht-metric-display>`, {
      hostProps: {
        value: '100',
        health: MetricHealth.Critical
      }
    });

    expect(spectator.query('.critical')).not.toBeNull();
  });

  test('displays superscript', () => {
    spectator = createHost(
      `<ht-metric-display [value]="value" [health]="health" [superscript]="superscript"></ht-metric-display>`,
      {
        hostProps: {
          value: '100',
          health: MetricHealth.Critical,
          superscript: 'Out'
        }
      }
    );

    expect(spectator.query('.superscript')).toHaveText('Out');
  });
});
