import { DatetimePickerComponent, InputComponent, LabelComponent } from '@hypertrace/components';
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';

describe('Date Time Picker Component', () => {
  let spectator: SpectatorHost<DatetimePickerComponent>;
  const onDateChangeSpy = jest.fn();
  const INIT_DATE_STRING = '2022-01-01T12:00';
  const initDate = new Date(INIT_DATE_STRING);
  const createHost = createHostFactory({
    component: DatetimePickerComponent,
    shallow: true,
    declarations: [MockComponent(LabelComponent), MockComponent(InputComponent)]
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
    expect(spectator.query(InputComponent)?.value).toEqual(INIT_DATE_STRING);
    const NEW_DATETIME_STRING = '2022-02-02T13:00';
    spectator.triggerEventHandler(InputComponent, 'valueChange', NEW_DATETIME_STRING);
    expect(onDateChangeSpy).toHaveBeenCalledWith(spectator.component.date);
  });

  test('date should not get effected when time is updated', () => {
    const validationSet = ['2020-10-10T12:18', '2020-01-01T00:30', '2020-01-01T23:59', '2020-01-01T00:00'];

    validationSet.forEach(dateTimeString => {
      spectator.setHostInput({ date: new Date(INIT_DATE_STRING) });
      spectator.triggerEventHandler(InputComponent, 'valueChange', dateTimeString);
      const changedDate = new Date(dateTimeString);
      expect(onDateChangeSpy).toHaveBeenCalledWith(changedDate);
      expect(spectator.component.getInputDate()).toEqual(dateTimeString);
    });
  });
});
