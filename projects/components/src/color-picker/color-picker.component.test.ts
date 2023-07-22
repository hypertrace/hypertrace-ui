import { CommonModule } from '@angular/common';
import { fakeAsync } from '@angular/core/testing';
import { IconType } from '@hypertrace/assets-library';
import { Color, NavigationService } from '@hypertrace/common';
import { IconComponent } from '@hypertrace/components';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { SketchComponent } from 'ngx-color/sketch';
import { NEVER, Observable } from 'rxjs';
import { NotificationService } from '../notification/notification.service';
import { PopoverModule } from '../popover/popover.module';
import { ColorPickerComponent } from './color-picker.component';

describe('Color Picker component', () => {
  let spectator: Spectator<ColorPickerComponent>;

  const createHost = createHostFactory({
    component: ColorPickerComponent,
    imports: [CommonModule, PopoverModule],
    providers: [
      mockProvider(NotificationService, { withNotification: (x: Observable<unknown>) => x }),
      mockProvider(NavigationService, {
        navigation$: NEVER
      })
    ],
    declarations: [MockComponent(SketchComponent), MockComponent(IconComponent)]
  });

  test('should render color picker with default colors', fakeAsync(() => {
    const onSelectionChangeSpy = jest.fn();
    spectator = createHost(
      `<ht-color-picker (selectedChange)="onSelectionChange($event)">
      </ht-color-picker>`,
      {
        hostProps: {
          onSelectionChange: onSelectionChangeSpy
        }
      }
    );

    const colors = spectator.queryAll('.color-picker .color');
    expect(colors.length).toBe(7);
    expect(spectator.query(IconComponent)?.icon).toBe(IconType.Add);

    spectator.click(colors[1]);
    expect(spectator.component.selected).toEqual(Color.Blue3);
    expect(onSelectionChangeSpy).toHaveBeenCalledWith(Color.Blue3);

    spectator.click('.add-icon');
    spectator.tick();

    expect(spectator.query('.color-sketch', { root: true })).toExist();
  }));
});
