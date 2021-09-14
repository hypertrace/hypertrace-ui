import { Color } from '@hypertrace/common';
import { TooltipModule } from '@hypertrace/components';
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';
import { MockModule } from 'ng-mocks';
import { ScoreBarComponent, ScoreBarDisplayType, ScoreBarValueType } from './score-bar.component';

describe('ProgressBarComponent', () => {
  let spectator!: SpectatorHost<ScoreBarComponent>;
  const createHost = createHostFactory({
    component: ScoreBarComponent,
    imports: [MockModule(TooltipModule)]
  });

  test('should render single bar view as expected for percentage value', () => {
    spectator = createHost(
      `<trace-score-bar
          [max]="maxValue"
          [value]="value"
          [valueType]="valueType"
          [fillColor]="fillColor"
        ></trace-score-bar>`,
      {
        hostProps: {
          maxValue: 100,
          value: 40,
          valueType: ScoreBarValueType.Percentage,
          fillColor: Color.Red5
        }
      }
    );

    expect(spectator.query('.continuous')).toExist();
    expect(spectator.query('.continuous .fill')).toExist();
    expect(spectator.query('.continuous .fill')?.getAttribute('style')).toBe(
      'width: 40%; background-color: rgb(253, 81, 56);'
    );
  });

  test('should render single bar view as expected for absolute value', () => {
    spectator = createHost(
      `<trace-score-bar
          [max]="maxValue"
          [value]="value"
          [valueType]="valueType"
          [fillColor]="fillColor"
        ></trace-score-bar>`,
      {
        hostProps: {
          maxValue: 60,
          value: 24,
          valueType: ScoreBarValueType.Absolute,
          fillColor: Color.Red5
        }
      }
    );

    expect(spectator.query('.continuous')).toExist();
    expect(spectator.query('.continuous .fill')).toExist();
    expect(spectator.query('.continuous .fill')?.getAttribute('style')).toBe(
      'width: 40%; background-color: rgb(253, 81, 56);'
    );
  });

  test('should render pill bar view as expected for absolute value', () => {
    spectator = createHost(
      `<trace-score-bar
          [max]="maxValue"
          [value]="value"
          [valueType]="valueType"
          [fillColor]="fillColor"
          [displayType]="displayType"
        ></trace-score-bar>`,
      {
        hostProps: {
          maxValue: 10,
          value: 4,
          valueType: ScoreBarValueType.Absolute,
          displayType: ScoreBarDisplayType.Pill,
          fillColor: Color.Red5
        }
      }
    );
    spectator.detectComponentChanges();
    expect(spectator.query('.pills')).toExist();
    const pills = spectator.queryAll('.pills .pill');
    expect(pills.length).toBe(10);
    for (let i = 0; i < 10; i++) {
      if (i < 4) {
        expect(pills[i].getAttribute('style')).toContain('background-color: rgb(253, 81, 56);');
      } else {
        expect(pills[i].getAttribute('style')).toContain('background-color: rgb(244, 245, 245);');
      }
    }
  });
});
