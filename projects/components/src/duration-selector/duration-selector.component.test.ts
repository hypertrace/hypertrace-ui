import { TimeUnit } from '@hypertrace/common';
import { CheckboxComponent, InputComponent, LabelComponent, SelectComponent } from '@hypertrace/components';
import { createHostFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { DurationConfig, DurationSelectorComponent } from './duration-selector.component';

describe('DurationSelectionComponent', () => {
  const mockDurationConfig: DurationConfig = {
    shouldApplyIndefinitely: true,
    timeValue: 1,
    unit: TimeUnit.Hour
  };
  const createComponent = createHostFactory({
    component: DurationSelectorComponent,
    shallow: true,
    declarations: [
      MockComponent(CheckboxComponent),
      MockComponent(InputComponent),
      MockComponent(SelectComponent),
      MockComponent(LabelComponent)
    ]
  });

  test('should render the component correctly by default', () => {
    const spectator = createComponent(
      '<ht-duration-selector [durationConfig]="durationConfig" [title]="title"></ht-duration-selector>',
      {
        hostProps: {
          durationConfig: mockDurationConfig,
          title: 'test title'
        }
      }
    );

    expect(spectator.query('.title')).toExist();
    expect(spectator.query(LabelComponent)?.label).toBe('test title');
    expect(spectator.query('.duration-config')).toExist();
    expect(spectator.query('.indefinite-duration-checkbox')).toExist();
  });

  test('should render the component when indefinite duration is toggled', () => {
    const spectator = createComponent(
      '<ht-duration-selector [durationConfig]="durationConfig"></ht-duration-selector>',
      {
        hostProps: {
          durationConfig: mockDurationConfig
        }
      }
    );
    spectator.triggerEventHandler(CheckboxComponent, 'checkedChange', false);

    expect(spectator.query(CheckboxComponent)?.checked).toBe(false);
    expect(spectator.query('.title')).toExist();
    expect(spectator.query('.duration-config')).toExist();
    expect(spectator.query('.time-value')).toExist();
    expect(spectator.query('.time-unit')).toExist();
  });

  test('duration validation should work as expected', () => {
    const spectator = createComponent(
      '<ht-duration-selector [durationConfig]="durationConfig"></ht-duration-selector>',
      {
        hostProps: {
          durationConfig: mockDurationConfig
        }
      }
    );
    const emitSpy = spyOn(spectator.component.durationConfigChange, 'emit');
    spectator.triggerEventHandler(CheckboxComponent, 'checkedChange', false);
    expect(emitSpy).toHaveBeenCalledWith({
      shouldApplyIndefinitely: false,
      timeValue: 1,
      unit: TimeUnit.Hour
    });
    spectator.triggerEventHandler(InputComponent, 'valueChange', 0);
    expect(spectator.queryAll(LabelComponent)[1].label).toBe('Time value has to be a valid number(>0)');
    expect(emitSpy).toHaveBeenCalledWith({
      shouldApplyIndefinitely: false,
      timeValue: 0,
      unit: TimeUnit.Hour
    });
  });
});
