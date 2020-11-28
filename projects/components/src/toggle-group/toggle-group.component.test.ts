import { fakeAsync } from '@angular/core/testing';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { LabelComponent } from '../label/label.component';
import { ToggleGroupComponent } from './toggle-group.component';
import { ToggleItem } from './toggle-item';
import { ToggleItemComponent } from './toggle-item.component';

describe('Toggle Group Component', () => {
  let spectator: Spectator<ToggleGroupComponent>;

  const createHost = createHostFactory({
    component: ToggleGroupComponent,
    shallow: true,
    declarations: [ToggleItemComponent, MockComponent(LabelComponent)]
  });

  test('should toggle items', fakeAsync(() => {
    const items: ToggleItem[] = [
      {
        label: 'First',
        value: 'first-value'
      },
      {
        label: 'Second',
        value: 'second-value'
      }
    ];
    const activeItem: ToggleItem = items[1];
    const activeItemChangeSpy = jest.fn();

    spectator = createHost(
      `
      <ht-toggle-group [items]="this.items" [activeItem]="this.activeItem" (activeItemChange)="this.activeItemChange($event)">
      </ht-toggle-group>
    `,
      {
        hostProps: {
          items: items,
          activeItem: activeItem,
          activeItemChange: activeItemChangeSpy
        }
      }
    );

    spectator.tick();
    expect(activeItemChangeSpy).toHaveBeenCalledWith(items[1]);

    spectator.click(spectator.queryAll('ht-toggle-item')[0]);
    expect(activeItemChangeSpy).toHaveBeenCalledWith(items[0]);
  }));
});
