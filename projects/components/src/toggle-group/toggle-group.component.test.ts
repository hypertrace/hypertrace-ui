import { fakeAsync } from '@angular/core/testing';
import { IconType } from '@hypertrace/assets-library';
import { Color } from '@hypertrace/common';
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
        value: 'first-value',
        tagValue: 'tag',
        tagColor: Color.Gray9,
        tagBackgroundColor: Color.White
      },
      {
        label: 'Second',
        icon: IconType.Add,
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

    const firstToggleItem = spectator.queryAll(ToggleItemComponent)[0];
    expect(firstToggleItem.label).toEqual(items[0].label);
    expect(firstToggleItem.tagValue).toEqual(items[0].tagValue);
    expect(firstToggleItem.tagColor).toEqual(items[0].tagColor);
    expect(firstToggleItem.tagBackgroundColor).toEqual(items[0].tagBackgroundColor);

    const secondToggleItem = spectator.queryAll(ToggleItemComponent)[1];
    expect(secondToggleItem.label).toEqual(items[1].label);
    expect(secondToggleItem.tagValue).toBeUndefined();
    expect(secondToggleItem.tagColor).toBeUndefined();
    expect(secondToggleItem.tagBackgroundColor).toBeUndefined();

  }));
});
