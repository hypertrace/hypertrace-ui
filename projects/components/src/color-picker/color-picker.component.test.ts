import { IconType } from '@hypertrace/assets-library';
import { IconComponent } from '@hypertrace/components';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { ColorPickerComponent } from './color-picker.component';
import { SketchComponent } from 'ngx-color/sketch';
import { PopoverModule } from '../popover/popover.module';
import { NotificationService } from '../notification/notification.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { MockComponent } from 'ng-mocks';

describe('Color Picker component', () => {
  let spectator: Spectator<ColorPickerComponent>;

  const createHost = createHostFactory({
    component: ColorPickerComponent,
    imports: [CommonModule, PopoverModule],
    providers: [mockProvider(NotificationService, { withNotification: (x: Observable<unknown>) => x })],
    declareComponent: false,
    declarations: [MockComponent(SketchComponent), MockComponent(IconComponent)]
  });

  test('should render color picker with default colors', () => {
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

    expect(spectator.queryAll('.color-picker .color').length).toBe(7);
    expect(spectator.query(IconComponent)?.icon).toBe(IconType.Add);
  });
});
