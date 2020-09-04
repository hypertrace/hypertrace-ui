import { fakeAsync } from '@angular/core/testing';
import { IconType } from '@hypertrace/assets-library';
import { IntervalDurationService, TimeDuration, TimeUnit } from '@hypertrace/common';
import { SelectComponent, SelectOptionComponent } from '@hypertrace/components';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { IntervalSelectComponent, IntervalValue } from './interval-select.component';

describe('Interval Select component', () => {
  const buildHost = createHostFactory({
    component: IntervalSelectComponent,
    declarations: [MockComponent(SelectComponent), MockComponent(SelectOptionComponent)],
    providers: [
      mockProvider(IntervalDurationService, {
        getAutoDurationFromTimeDurations: () => new TimeDuration(3, TimeUnit.Minute)
      })
    ],
    shallow: true
  });

  const intervalOptions = [
    'NONE',
    'AUTO',
    new TimeDuration(1, TimeUnit.Minute),
    new TimeDuration(5, TimeUnit.Hour),
    new TimeDuration(2, TimeUnit.Day)
  ];
  test('show disabled if disabled provided', () => {
    const spectator = buildHost(
      `
    <ht-interval-select [intervalOptions]="intervalOptions" [interval]="interval" [disabled]="disabled">
    </ht-interval-select>`,
      {
        hostProps: {
          intervalOptions: intervalOptions,
          interval: 'NONE',
          disabled: false
        }
      }
    );

    expect(spectator.query(SelectComponent)!.disabled).toBe(false);
    spectator.setHostInput({ disabled: true });
    expect(spectator.query(SelectComponent)!.disabled).toBe(true);
  });

  test('show disabled if no options, or a single option is provided', fakeAsync(() => {
    const spectator = buildHost(
      `
    <ht-interval-select [intervalOptions]="intervalOptions" [interval]="interval" [disabled]="disabled">
    </ht-interval-select>`,
      {
        hostProps: {
          intervalOptions: [] as IntervalValue[],
          interval: 'NONE',
          disabled: false
        }
      }
    );
    spectator.tick();

    expect(spectator.query(SelectComponent)!.disabled).toBe(true);

    spectator.setHostInput({ intervalOptions: ['AUTO'] });
    expect(spectator.query(SelectComponent)!.disabled).toBe(true);
    spectator.setHostInput({ intervalOptions: ['AUTO', new TimeDuration(1, TimeUnit.Minute)] });
    expect(spectator.query(SelectComponent)!.disabled).toBe(false);
  }));

  test('shows time icon only if requested', () => {
    const spectator = buildHost(
      `
    <ht-interval-select [intervalOptions]="intervalOptions" [interval]="interval" [showIcon]="icon">
    </ht-interval-select>`,
      {
        hostProps: {
          intervalOptions: intervalOptions,
          interval: 'AUTO',
          icon: false
        }
      }
    );

    expect(spectator.query(SelectComponent)!.icon).toBe(undefined);
    spectator.setHostInput({ icon: true });
    expect(spectator.query(SelectComponent)!.icon).toBe(IconType.Time);
  });

  test('displays initial selection', fakeAsync(() => {
    const spectator = buildHost(
      `
    <ht-interval-select [intervalOptions]="intervalOptions" [interval]="interval">
    </ht-interval-select>`,
      {
        hostProps: {
          intervalOptions: intervalOptions,
          interval: intervalOptions[3]
        }
      }
    );

    spectator.tick();

    expect(spectator.query(SelectComponent)!.selected).toEqual(new TimeDuration(5, TimeUnit.Hour));
  }));

  test('uses provided selection options', () => {
    const spectator = buildHost(
      `
    <ht-interval-select [intervalOptions]="intervalOptions" [interval]="interval">
    </ht-interval-select>`,
      {
        hostProps: {
          intervalOptions: intervalOptions,
          interval: 'NONE'
        }
      }
    );

    const options = spectator.queryAll(SelectOptionComponent);

    expect(options.length).toBe(5);
    expect(options[0].label).toEqual('None');
    expect(options[1].label).toEqual('Auto (3m)');
    expect(options[2].label).toEqual('1m');
    expect(options[3].label).toEqual('5h');
    expect(options[4].label).toEqual('2d');
  });

  test('emits on selection change', () => {
    const onChange = jest.fn();
    const spectator = buildHost(
      `
    <ht-interval-select [intervalOptions]="intervalOptions" [interval]="interval" (intervalChange)="onChange($event)">
    </ht-interval-select>`,
      {
        hostProps: {
          intervalOptions: intervalOptions,
          interval: 'NONE',
          onChange: onChange
        }
      }
    );

    spectator.triggerEventHandler('htc-select', 'selectedChange', new TimeDuration(1, TimeUnit.Minute));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(new TimeDuration(1, TimeUnit.Minute));
  });
});
