import { fakeAsync } from '@angular/core/testing';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KeyCode } from '@hypertrace/common';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponents } from 'ng-mocks';
import { InputPillListComponent } from './input-pill-list.component';
import { InputComponent } from '../input/input.component';
import { PopoverService } from '../popover/popover.service';

describe('InputPillListComponent', () => {
  let spectator: SpectatorHost<InputPillListComponent>;
  const createHost = createHostFactory({
    component: InputPillListComponent,
    shallow: true,
    imports: [ReactiveFormsModule],
    declarations: [MockComponents(InputComponent)],
    providers: [
      FormBuilder,
      mockProvider(PopoverService, {
        drawPopover: jest.fn().mockReturnValue({ close: jest.fn(), closeOnBackdropClick: jest.fn() })
      })
    ]
  });

  const getPillValues = (spectatorInstance: SpectatorHost<InputPillListComponent>): string[] =>
    spectatorInstance.component.pillControlsArray.value.map((control: FormControl) => control.value);
  const getInputValue = (spectatorInstance: SpectatorHost<InputPillListComponent>): string | undefined =>
    spectatorInstance.component.form.get('inputBuffer')?.value;

  test('should initialize with no input, as expected', () => {
    spectator = createHost(`<ht-input-pill-list></ht-input-pill-list>`);
    // Header section
    expect(spectator.query('.header')).toExist();
    expect(spectator.query('.primary-input')).toExist();
    expect(getInputValue(spectator)).toEqual('');
    expect(spectator.component.currentValues).toEqual([]);

    // Pills section
    expect(spectator.query('.pill-list')).not.toExist();
  });

  test('should initialize with input, as expected', () => {
    spectator = createHost(`<ht-input-pill-list [values]="values"></ht-input-pill-list>`, {
      hostProps: {
        values: ['test-1', 'test-2']
      }
    });
    // Header section
    expect(spectator.query('.header')).toExist();
    expect(spectator.query('.primary-input')).toExist();
    expect(getInputValue(spectator)).toEqual('');

    // Pills section
    expect(spectator.query('.pill-list')).toExist();
    expect(getPillValues(spectator)).toEqual(['test-1', 'test-2']);
  });

  test('interactions should function as expected', fakeAsync(() => {
    spectator = createHost(
      `<ht-input-pill-list [values]="values" [dropdownValues]="dropdownValues"></ht-input-pill-list>`,
      {
        hostProps: {
          values: ['test-1', 'test-2'],
          dropdownValues: ['drop-1']
        }
      }
    );

    const valueChangeEmitterSpy = jest.spyOn(spectator.component.valueChange, 'next');

    // Header section
    expect(spectator.query('.header')).toExist();
    expect(spectator.query('.primary-input')).toExist();
    expect(getInputValue(spectator)).toEqual('');

    // Modify input. Verify no emits. Verify no change for pill list.
    spectator.component.form.get('inputBuffer')?.setValue('input-from-buffer');
    expect(getPillValues(spectator)).toEqual(['test-1', 'test-2']);
    expect(valueChangeEmitterSpy).not.toHaveBeenCalled();

    // Keydown on enter. Verify emits. Verify pill list.
    spectator.triggerEventHandler('.primary-input', 'keydown', { key: KeyCode.Enter, preventDefault: jest.fn() });
    expect(getPillValues(spectator)).toEqual(['input-from-buffer', 'test-1', 'test-2']);
    expect(valueChangeEmitterSpy).toHaveBeenCalledWith(['input-from-buffer', 'test-1', 'test-2']);
    expect(valueChangeEmitterSpy).toHaveBeenCalledTimes(1);

    // Ignore a duplicate value
    spectator.triggerEventHandler('.primary-input', 'valueChange', 'test-2');
    spectator.triggerEventHandler('.primary-input', 'keydown.enter', { key: KeyCode.Enter, preventDefault: jest.fn() });
    expect(getPillValues(spectator)).toEqual(['input-from-buffer', 'test-1', 'test-2']);
    expect(valueChangeEmitterSpy).toHaveBeenCalledTimes(1);

    // Update a pill in place. Verify emit and pill list on valueChange.
    const secondPill = spectator.debugElement.queryAll(By.css('.secondary-input'))[1];
    ((spectator.component.form.get('pillControls') as FormArray)?.at(1) as FormGroup).patchValue({
      value: 'i-am-test-2-now'
    });
    spectator.triggerEventHandler(secondPill, 'valueChange', undefined);

    // Debounce of 200ms is applied on the pill input update. Wait for it.
    spectator.tick(250);
    expect(getPillValues(spectator)).toEqual(['input-from-buffer', 'i-am-test-2-now', 'test-2']);
    expect(valueChangeEmitterSpy).toHaveBeenCalledWith(['input-from-buffer', 'i-am-test-2-now', 'test-2']);
    expect(valueChangeEmitterSpy).toHaveBeenCalledTimes(2);

    // On Focus
    spectator.component.onFocus();
    expect(spectator.inject(PopoverService).drawPopover).toHaveBeenCalled();
    spectator.component.onDropdownValueClick('drop-1');
    expect(getPillValues(spectator)).toEqual(['drop-1', 'input-from-buffer', 'i-am-test-2-now', 'test-2']);
    expect(valueChangeEmitterSpy).toHaveBeenCalledTimes(3);
  }));
});
