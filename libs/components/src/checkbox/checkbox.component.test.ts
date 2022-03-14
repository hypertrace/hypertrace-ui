import { fakeAsync } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { CheckboxComponent } from './checkbox.component';
import { TraceCheckboxModule } from './checkbox.module';

describe('Checkbox component', () => {
  let spectator: Spectator<CheckboxComponent>;

  const createHost = createHostFactory({
    component: CheckboxComponent,
    imports: [TraceCheckboxModule, RouterTestingModule, ReactiveFormsModule],
    providers: [],
    declareComponent: false
  });

  test('should apply disabled attribute when disabled', () => {
    spectator = createHost(
      `<ht-checkbox [label]="label" [disabled]="disabled">
    </ht-checkbox>`,
      {
        hostProps: {
          label: 'TEST',
          disabled: true
        }
      }
    );

    const selected: Element | null = spectator.query('mat-checkbox');
    const disabled: string | null = selected!.getAttribute('ng-reflect-disabled');
    expect(disabled).toBe('true');
  });

  test('should callback and change checked value when clicked', fakeAsync(() => {
    const checkboxChangeSpy = jest.fn();
    spectator = createHost(
      `<ht-checkbox [label]="label" [checked]="checked" [disabled]="disabled" (checkedChange)="onCheckboxChange($event)">
    </ht-checkbox>`,
      {
        hostProps: {
          label: 'TEST',
          checked: false,
          disabled: false,
          onCheckboxChange: checkboxChangeSpy
        }
      }
    );

    spectator.tick();

    const inputElement = spectator.query('input')!;

    // Click will toggle the values to true
    spectator.click(inputElement);
    expect(spectator.component.isChecked).toBe(true);
    expect(checkboxChangeSpy).toHaveBeenCalledWith(true);

    // Click will toggle the values to false
    spectator.click(inputElement);
    expect(spectator.component.isChecked).toBe(false);
    expect(checkboxChangeSpy).toHaveBeenCalledWith(false);
  }));

  test('should work correctly with control value accessor', () => {
    const formControl = new FormControl(false);
    spectator = createHost(
      `<ht-checkbox [label]="label" [formControl]="formControl">
    </ht-checkbox>`,
      {
        hostProps: {
          formControl: formControl
        }
      }
    );
    expect(spectator.component.isChecked).toBe(false);

    formControl.setValue(true);
    expect(spectator.component.isChecked).toBe(true);

    formControl.disable();
    expect(spectator.component.isDisabled).toBe(true);
  });
});
