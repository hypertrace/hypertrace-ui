import { fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { CheckboxComponent } from './checkbox.component';
import { TraceCheckboxModule } from './checkbox.module';

describe('Checkbox component', () => {
  let spectator: Spectator<CheckboxComponent>;

  const createHost = createHostFactory({
    component: CheckboxComponent,
    imports: [TraceCheckboxModule, RouterTestingModule],
    providers: [],
    declareComponent: false
  });

  test('should apply disabled attribute when disabled', () => {
    spectator = createHost(
      `<htc-checkbox [label]="label" [disabled]="disabled">
    </htc-checkbox>`,
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
      `<htc-checkbox [label]="label" [checked]="checked" [disabled]="disabled" (checkedChange)="onCheckboxChange($event)">
    </htc-checkbox>`,
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
    expect(spectator.component.checked).toBe(true);
    expect(checkboxChangeSpy).toHaveBeenCalledWith(true);

    // Click will toggle the values to false
    spectator.click(inputElement);
    expect(spectator.component.checked).toBe(false);
    expect(checkboxChangeSpy).toHaveBeenCalledWith(false);
  }));
});
