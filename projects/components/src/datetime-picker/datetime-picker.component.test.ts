import { Time } from '@hypertrace/common';
import { DatetimePickerComponent, InputComponent, LabelComponent, TimePickerComponent } from '@hypertrace/components';
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';

describe('Date Time Picker Component', () => {
  let spectator: SpectatorHost<DatetimePickerComponent>;
  const onDateChangeSpy = jest.fn();
  const initDate = new Date();
  const createHost = createHostFactory({
    component: DatetimePickerComponent,
    shallow: true,
    declarations: [MockComponent(LabelComponent), MockComponent(InputComponent), MockComponent(TimePickerComponent)]
  });

  beforeEach(() => {
    spectator = createHost(
      `<ht-datetime-picker [date]="date" [showTimeTriggerIcon]="showTimeTriggerIcon" (dateChange)="onDateChange($event)"></ht-datetime-picker>`,
      {
        hostProps: {
          date: initDate,
          showTimeTriggerIcon: false,
          onDateChange: onDateChangeSpy
        }
      }
    );
  });

  test('should render all elements correctly', () => {
    expect(spectator.query(LabelComponent)).not.toExist();
    expect(spectator.query(InputComponent)?.value).toEqual(initDate.toISOString().slice(0, 10));

    const timePicker = spectator.query(TimePickerComponent);
    expect(timePicker).toExist();
    expect(timePicker?.time).toEqual(new Time(initDate.getHours(), initDate.getMinutes()));
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

  test('date should not get effected when time is updated', () => {
    const validationSet = [
      {
        date: new Date('2020-10-10'),
        time: new Time(18, 10, 0, 0, true),
        expected: '2020-10-10'
      },
      {
        date: new Date('2020-1-1'),
        time: new Time(0, 30, 0, 0, true),
        expected: '2020-01-01'
      },
      {
        date: new Date('2020-1-1'),
        time: new Time(23, 59, 0, 0, true),
        expected: '2020-01-01'
      },
      {
        date: new Date('2020-1-1'),
        time: new Time(0, 0, 0, 0, true),
        expected: '2020-01-01'
      }
    ];

    validationSet.forEach(({ date, time, expected }) => {
      spectator.setHostInput({ date: date });
      spectator.triggerEventHandler(TimePickerComponent, 'timeChange', time);
      const changedDate = new Date(date.valueOf());
      changedDate.setHours(time.hours, time.minutes);
      expect(onDateChangeSpy).toHaveBeenCalledWith(changedDate);
      expect(spectator.component.getInputDate()).toEqual(expected);
    });
  });
});
