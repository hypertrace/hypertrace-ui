import { fakeAsync } from '@angular/core/testing';
import { IconType } from '@hypertrace/assets-library';
import { Color } from '@hypertrace/common';
import { MenuItemComponent } from '@hypertrace/components';
import { createHostFactory } from '@ngneat/spectator/jest';

describe('Menu Item Component', () => {
  const createHost = createHostFactory<MenuItemComponent>({
    component: MenuItemComponent,
    shallow: true
  });

  test('should display icon and label as expected', fakeAsync(() => {
    const spectator = createHost(
      '<ht-menu-item [icon]="icon" [label]="label" [iconColor]="iconColor"></ht-menu-item>',
      {
        hostProps: { icon: IconType.MoreHorizontal, label: 'Item', iconColor: Color.Gray1 }
      }
    );
    expect(spectator.query('.menu-item', { root: true })).toExist();
    expect(spectator.query('.icon', { root: true })).toExist();
    expect(spectator.query('.label', { root: true })).toHaveText('Item');
  }));
});
