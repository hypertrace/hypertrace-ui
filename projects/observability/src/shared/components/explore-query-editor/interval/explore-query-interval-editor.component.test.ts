import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, flush } from '@angular/core/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { NavigationService, TimeDuration, TimeRangeService, TimeUnit } from '@hypertrace/common';
import { byText, createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';
import { IntervalSelectModule } from '../../interval-select/interval-select.module';
import { ExploreQueryIntervalEditorComponent } from './explore-query-interval-editor.component';

describe('Explore Query Interval Editor component', () => {
  const hostBuilder = createHostFactory({
    component: ExploreQueryIntervalEditorComponent,
    imports: [IntervalSelectModule, CommonModule, HttpClientTestingModule, IconLibraryTestingModule],
    providers: [
      mockProvider(NavigationService, {
        navigation$: EMPTY
      })
    ]
  });

  test('displays the provided interval', fakeAsync(() => {
    const spectator = hostBuilder(
      `
    <ht-explore-query-interval-editor [interval]="interval">
    </ht-explore-query-interval-editor>`,
      {
        hostProps: {
          interval: new TimeDuration(5, TimeUnit.Minute)
        }
      }
    );
    spectator.tick();

    expect(spectator.element).toHaveText('5m');

    spectator.setHostInput({ interval: new TimeDuration(1, TimeUnit.Minute) });
    expect(spectator.element).toHaveText('1m');
  }));

  test('sets interval to None by default', fakeAsync(() => {
    const spectator = hostBuilder(
      `
    <ht-explore-query-interval-editor>
    </ht-explore-query-interval-editor>`
    );
    spectator.tick();

    expect(spectator.element).toHaveText('None');
  }));

  test('emits changes to interval', fakeAsync(() => {
    const onChange = jest.fn();
    const spectator = hostBuilder(
      `
    <ht-explore-query-interval-editor (intervalChange)="onChange($event)">
    </ht-explore-query-interval-editor>`,
      {
        hostProps: {
          onChange: onChange
        }
      }
    );
    spectator.tick();

    spectator.click(spectator.query(byText('None'))!);
    const options = spectator.queryAll('.select-option', { root: true });
    expect(options.length).toBe(7);

    spectator.click(options.find(option => option.textContent!.includes('Auto')));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('AUTO');

    expect(spectator.element).toHaveText('Auto (15m)');
    flush();
  }));

  test('updates interval list when time range changes', fakeAsync(() => {
    const spectator = hostBuilder(
      `
    <ht-explore-query-interval-editor>
    </ht-explore-query-interval-editor>`
    );
    spectator.tick();

    spectator.click(spectator.query(byText('None'))!);
    const options = spectator.queryAll('.select-option', { root: true });
    expect(options.length).toBe(7);
    expect(options[1]).toHaveText('Auto (15m)');
    spectator.inject(TimeRangeService).setRelativeRange(3, TimeUnit.Hour);
    spectator.detectChanges();
    const newOptions = spectator.queryAll('.select-option', { root: true });
    expect(newOptions.length).toBe(8);
    expect(newOptions[1]).toHaveText('Auto (1h)');
    flush();
  }));

  test('emits interval changeto auto if selected interval is not in range', fakeAsync(() => {
    const onChange = jest.fn();
    const spectator = hostBuilder(
      `
    <ht-explore-query-interval-editor [interval]="interval" (intervalChange)="onChange($event)">
    </ht-explore-query-interval-editor>`,
      {
        hostProps: {
          interval: new TimeDuration(15, TimeUnit.Second),
          onChange: onChange
        }
      }
    );
    spectator.tick();

    expect(spectator.element).toHaveText('15s');

    spectator.inject(TimeRangeService).setRelativeRange(3, TimeUnit.Hour);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('AUTO');
  }));
});
