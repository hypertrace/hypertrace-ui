import { fakeAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatInput, MatInputModule } from '@angular/material/input';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createHostFactory } from '@ngneat/spectator/jest';
import { InputComponent } from './input.component';

describe('Input Component', () => {
  const hostFactory = createHostFactory({
    component: InputComponent,
    imports: [MatInputModule, FormsModule],
    shallow: true
  });

  test('should apply disabled attribute when disabled', fakeAsync(() => {
    const spectator = hostFactory(`
    <ht-input [disabled]="true">
    </ht-input>`);

    spectator.tick();
    expect(spectator.query(MatInput)!.disabled).toBe(true);
    expect(spectator.query('mat-form-field')).toHaveClass('disabled');
  }));

  test('should emit number values for inputs of type number', () => {
    const onChange = jest.fn();
    const spectator = hostFactory(
      `
    <ht-input [disabled]="true" [type]="type" (valueChange)="onChange($event)">
    </ht-input>`,
      {
        hostProps: {
          onChange: onChange,
          type: 'number'
        }
      }
    );

    const inputEl = spectator.query('input') as HTMLInputElement;

    inputEl.value = '5';
    spectator.dispatchFakeEvent(inputEl, 'input');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(5);

    spectator.setHostInput({
      type: 'text'
    });
    inputEl.value = '7';
    spectator.dispatchFakeEvent(inputEl, 'input');
    expect(onChange).toHaveBeenLastCalledWith('7');
  });

  test('should set correct placeholder value', () => {
    const spectator = hostFactory(
      `
    <ht-input [type]="type" [placeholder]="placeholder">
    </ht-input>`,
      {
        hostProps: {
          type: 'string',
          placeholder: 'placeholder'
        }
      }
    );

    const matInput = spectator.query(MatInput);
    expect(matInput?.placeholder).toEqual('placeholder');
  });

  test('should work with arbitrary debounce time', fakeAsync(() => {
    const spectator = hostFactory(
      `<ht-input [type]="type" [placeholder]="placeholder" [debounceTime]="debounceTime"></ht-input>`,
      {
        hostProps: {
          type: 'string',
          placeholder: 'placeholder',
          debounceTime: 200
        }
      }
    );

    const inputElement = spectator.query('input');
    expect((inputElement as HTMLInputElement)?.placeholder).toEqual('Test Placeholder');
    spectator.component.value = 'Test2';

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.valueChange).toBe('200ms x', {
        x: 'Test2'
      });

      spectator.component.onValueChange(spectator.component.value?.toString());
      spectator.tick();
    });
  }));
});
