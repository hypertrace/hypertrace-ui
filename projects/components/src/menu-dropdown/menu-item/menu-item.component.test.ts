import { fakeAsync } from '@angular/core/testing';
import { IconType } from '@hypertrace/assets-library';
import { Color, NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { IconComponent } from '../../icon/icon.component';
import { MenuItemComponent } from './menu-item.component';

describe('Menu Item Component', () => {
  const createHost = createHostFactory<MenuItemComponent>({
    component: MenuItemComponent,
    declarations: [MockComponent(IconComponent)],
    providers: [mockProvider(NavigationService)],
    shallow: true
  });

  test('should display icon and label as expected', fakeAsync(() => {
    const spectator = createHost(
      '<ht-menu-item [icon]="icon" [label]="label" [labelColor]="labelColor" [iconColor]="iconColor"></ht-menu-item>',
      {
        hostProps: { icon: IconType.MoreHorizontal, label: 'Item', labelColor: Color.Gray1, iconColor: Color.Gray1 }
      }
    );
    expect(spectator.query('.menu-item')).toExist();
    expect(spectator.query('.icon')).toExist();
    expect(spectator.query('.label')).toHaveText('Item');
    expect((spectator.query('.label') as HTMLSpanElement)?.style.color).toEqual('rgb(244, 245, 245)');
    expect(spectator.query(IconComponent)?.icon).toBe(IconType.MoreHorizontal);
    expect(spectator.query(IconComponent)?.color).toBe(Color.Gray1);
  }));

  test('should disable menu item as expected', fakeAsync(() => {
    const spectator = createHost(
      '<ht-menu-item [icon]="icon" [label]="label" [iconColor]="iconColor" [disabled]="disabled"></ht-menu-item>',
      {
        hostProps: {
          icon: IconType.MoreHorizontal,
          label: 'Item',
          iconColor: Color.Gray1,
          disabled: true
        }
      }
    );
    expect(spectator.query('.menu-item')).toExist();
    expect(spectator.query('.icon')).toExist();
    expect(spectator.query('.label')).toHaveText('Item');
    expect(spectator.query(IconComponent)?.icon).toBe(IconType.MoreHorizontal);
    expect(spectator.query(IconComponent)?.color).toBe(Color.Gray1);
    expect(spectator.query('.menu-item')?.classList.contains('disabled')).toBe(true);
  }));
});
