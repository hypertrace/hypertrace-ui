import { fakeAsync } from '@angular/core/testing';
import { IconType } from '@hypertrace/assets-library';
import { MenuDropdownComponent, MenuItemComponent } from '@hypertrace/components';
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';
import { LabelComponent } from '../label/label.component';

describe('Menu dropdown Component', () => {
  const hostFactory = createHostFactory<MenuDropdownComponent>({
    component: MenuDropdownComponent,
    declarations: [LabelComponent, MenuItemComponent],
    shallow: true
  });

  let spectator: SpectatorHost<MenuDropdownComponent>;

  test('should display trigger content as expected', () => {
    spectator = hostFactory(
      `
    <ht-menu-dropdown label="Settings" icon="${IconType.MoreHorizontal}">
        </ht-menu-dropdown>`
    );

    expect(spectator.query('.trigger-content')).toExist();
    expect(spectator.query('.trigger-label')).toExist();
    expect(spectator.query('.trigger-icon')).toExist();
  });

  test('should display menu items with icons when clicked', fakeAsync(() => {
    spectator = hostFactory(
      `
    <ht-menu-dropdown label="Settings" icon="${IconType.MoreHorizontal}">
          <ht-menu-item label="Do X"></ht-menu-item>
          <ht-menu-item label="Do Y"></ht-menu-item>
        </ht-menu-dropdown>`
    );

    spectator.click('.trigger-content');
    const optionElements = spectator.queryAll('.menu-item', { root: true });
    expect(spectator.query('.dropdown-content', { root: true })).toExist();
    expect(optionElements.length).toBe(2);

    expect(optionElements[0]).toHaveText('Do X');
    expect(optionElements[1]).toHaveText('Do Y');
  }));
});
