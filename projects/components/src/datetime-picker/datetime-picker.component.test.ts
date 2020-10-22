import { Time } from '@hypertrace/common';
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { InputComponent } from '../input/input.component';
import { LabelComponent } from './../label/label.component';
import { TimePickerComponent } from './../time-picker/time-picker.component';
import { DatetimePickerComponent } from './datetime-picker.component';

describe('Date Time Picker Component', () => {
  let spectator: SpectatorHost<DatetimePickerComponent>;

  const createHost = createHostFactory({
    component: DatetimePickerComponent,
    shallow: true,
    declarations: [MockComponent(LabelComponent), MockComponent(InputComponent), MockComponent(TimePickerComponent)]
  });

  test('should render all elements correctly', () => {
    const onDateChangeSpy = jest.fn();
    const date = new Date();

    spectator = createHost(
      `<ht-datetime-picker [date]="date" [showTimeTriggerIcon]="showTimeTriggerIcon" (dateChange)="onDateChange($event)"></ht-datetime-picker>`,
      {
        hostProps: {
          date: date,
          showTimeTriggerIcon: false,
          onDateChange: onDateChangeSpy
        }
      }
    );

    expect(spectator.query(LabelComponent)).not.toExist();
    expect(spectator.query(InputComponent)?.value).toEqual(date.toISOString().slice(0, 10));

    const timePicker = spectator.query(TimePickerComponent);
    expect(timePicker).toExist();
    expect(timePicker?.time).toEqual(new Time(date.getHours(), date.getMinutes()));
    expect(timePicker?.showTimeTriggerIcon).toEqual(false);

    spectator.triggerEventHandler(InputComponent, 'valueChange', '2020-10-10');
    expect(onDateChangeSpy).toHaveBeenCalledWith(spectator.component.date);

    const changedTime = new Time(10);
    spectator.triggerEventHandler(TimePickerComponent, 'timeChange', changedTime);
    const changedDate = new Date(spectator.component.date!.valueOf());
    changedDate.setHours(changedTime.hours);
    changedDate.setMinutes(changedTime.minutes);
    expect(onDateChangeSpy).toHaveBeenCalledWith(changedDate);
  });
});
