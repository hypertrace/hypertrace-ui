import { fakeAsync } from '@angular/core/testing';
import { NavigationService, Time } from '@hypertrace/common';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { PopoverModule } from '../popover/popover.module';
import { PredefinedTimeService } from '../time-range/predefined-time.service';
import { LabelComponent } from './../label/label.component';
import { TimePickerComponent } from './time-picker.component';

describe('Time Picker Component', () => {
  let spectator: SpectatorHost<TimePickerComponent>;

  const createHost = createHostFactory({
    component: TimePickerComponent,
    shallow: true,
    imports: [PopoverModule],
    providers: [
      mockProvider(PredefinedTimeService, {
        getPredefinedTimes: jest
          .fn()
          .mockReturnValue([new Time(8), new Time(9), new Time(10), new Time(11), new Time(12)])
      }),
      mockProvider(NavigationService, {
        navigation$: of(true)
      })
    ],
    declarations: [MockComponent(LabelComponent)]
  });

  test('should render all trigger elements correctly', fakeAsync(() => {
    const onTimeChangeSpy = jest.fn();
    const time = new Time(10);
    spectator = createHost(
      `<ht-time-picker [time]="time" [showTimeTriggerIcon]="showTimeTriggerIcon" (timeChange)="onTimeChange($event)"></ht-time-picker>`,
      {
        hostProps: {
          time: time,
          showTimeTriggerIcon: false,
          onTimeChange: onTimeChangeSpy
        }
      }
    );

    spectator.tick();

    expect(spectator.query('.trigger-icon')).not.toExist();
    expect(spectator.query(LabelComponent)?.label).toEqual(time.label);
    expect(spectator.query('.trigger-caret')).toExist();

    spectator.setHostInput({
      showTimeTriggerIcon: true
    });
    expect(spectator.query('.trigger-icon')).toExist();

    spectator.component.onTimeChange(spectator.component.predefinedTimes[0]);
    expect(onTimeChangeSpy).toHaveBeenCalledWith(spectator.component.predefinedTimes[0]);
  }));
});
