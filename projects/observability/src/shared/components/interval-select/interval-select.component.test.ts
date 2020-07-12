import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, flush } from '@angular/core/testing';
import { IconLibraryTestingModule, IconType } from '@hypertrace/assets-library';
import { IntervalDurationService, NavigationService, TimeDuration, TimeUnit } from '@hypertrace/common';
import { SelectComponent } from '@hypertrace/components';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { IntervalSelectComponent, IntervalValue } from './interval-select.component';
import { IntervalSelectModule } from './interval-select.module';

describe('Interval Select component', () => {
  const buildHost = createHostFactory({
    component: IntervalSelectComponent,
    imports: [IntervalSelectModule, HttpClientTestingModule, IconLibraryTestingModule],
    providers: [
      mockProvider(IntervalDurationService, {
        getAutoDuration: () => new TimeDuration(3, TimeUnit.Minute)
      }),
      mockProvider(NavigationService)
    ],
    declareComponent: false
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

    expect(spectator.element).toHaveText('5h');
  }));

  test('uses provided selection options', fakeAsync(() => {
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

    spectator.tick();

    spectator.click(spectator.query('.trigger-content')!);

    const options = spectator.queryAll('.select-option', { root: true });

    expect(options.length).toBe(5);
    expect(options[0]).toHaveText('None');
    expect(options[1]).toHaveText('Auto (3m)');
    expect(options[2]).toHaveText('1m');
    expect(options[3]).toHaveText('5h');
    expect(options[4]).toHaveText('2d');
  }));

  test('emits on selection change and updates display', fakeAsync(() => {
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

    spectator.tick();

    spectator.click(spectator.query('.trigger-content')!);
    spectator.click(spectator.queryAll('.select-option', { root: true })[2]);

    expect(spectator.element).toHaveText('1m');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(intervalOptions[2]);

    flush();
  }));
});
