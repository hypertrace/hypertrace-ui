import { fakeAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { createHostFactory } from '@ngneat/spectator/jest';
import { NumberInputAppearance } from './number-input-appearance';
import { NumberInputComponent } from './number-input.component';

describe('Number Input Component', () => {
  const hostFactory = createHostFactory({
    component: NumberInputComponent,
    imports: [FormsModule],
    shallow: true
  });

  test('should apply disabled attribute when disabled', fakeAsync(() => {
    const spectator = hostFactory(`
    <ht-number-input [disabled]="true">
    </ht-number-input>`);

    spectator.tick();
    expect(spectator.query('input')!.getAttributeNames().includes('disabled')).toBe(true);
  }));

  test('should apply border style correctly', fakeAsync(() => {
    const spectator = hostFactory(
      `
    <ht-number-input [appearance]="appearance">
    </ht-number-input>`,
      {
        hostProps: {
          appearance: NumberInputAppearance.Border
        }
      }
    );

    spectator.tick();
    expect(spectator.query('input')?.classList).toContain('border');
  }));

  test('should apply underline style correctly', fakeAsync(() => {
    const spectator = hostFactory(
      `
    <ht-number-input [appearance]="appearance">
    </ht-number-input>`,
      {
        hostProps: {
          appearance: NumberInputAppearance.Underline
        }
      }
    );

    spectator.tick();
    expect(spectator.query('input')?.classList).toContain('underline');
  }));

  test('should emit correct values on value change', fakeAsync(() => {
    const spectator = hostFactory(`
    <ht-number-input minValue="1" maxValue="10">
    </ht-number-input>`);

    spectator.tick();
    spyOn(spectator.component.valueChange, 'emit');
    spectator.triggerEventHandler('input', 'ngModelChange', 7);
    expect(spectator.component.valueChange.emit).toHaveBeenCalledWith(7);

    spectator.triggerEventHandler('input', 'ngModelChange', 15);
    expect(spectator.component.valueChange.emit).toHaveBeenCalledWith(10);

    spectator.triggerEventHandler('input', 'ngModelChange', -1);
    expect(spectator.component.valueChange.emit).toHaveBeenCalledWith(1);
  }));
});
