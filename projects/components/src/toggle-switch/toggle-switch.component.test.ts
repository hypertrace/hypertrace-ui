import { CommonModule } from '@angular/common';
import { fakeAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSlideToggle, MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { ToggleSwitchSize } from './toggle-switch-size';
import { ToggleSwitchComponent } from './toggle-switch.component';

describe('Toggle Switch Component', () => {
  let spectator: Spectator<ToggleSwitchComponent>;

  const createHost = createHostFactory({
    component: ToggleSwitchComponent,
    shallow: true,
    imports: [MatSlideToggleModule, FormsModule, CommonModule]
  });

  test('should pass properties to Mat Slide toggle correctly', fakeAsync(() => {
    const onCheckedChangeSpy = jest.fn();
    spectator = createHost(
      `<ht-toggle-switch [checked]="checked" [label]="label" [disabled]="disabled" [size]="size" (checkedChange)="onCheckedChange($event)"></ht-toggle-switch>`,
      {
        hostProps: {
          checked: true,
          label: 'label',
          disabled: false,
          size: ToggleSwitchSize.Small,
          onCheckedChange: onCheckedChangeSpy
        }
      }
    );
    const matToggleComponent = spectator.query(MatSlideToggle);
    spectator.tick();

    expect(matToggleComponent).toExist();
    expect(matToggleComponent?.checked).toBeTruthy();
    expect(matToggleComponent?.disabled).toBeFalsy();
    expect(spectator.query('.label')).toHaveText('label');
    expect(spectator.query('mat-slide-toggle')).toHaveClass('small-slide-toogle');

    spectator.triggerEventHandler(MatSlideToggle, 'change', new MatSlideToggleChange(matToggleComponent!, false));
    expect(onCheckedChangeSpy).toHaveBeenCalledWith(false);
  }));
});
