import { fakeAsync, flush } from '@angular/core/testing';
import { IconType } from '@hypertrace/assets-library';
import { MenuDropdownComponent, MenuItemComponent } from '@hypertrace/components';
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { noop } from 'rxjs';
import { LabelComponent } from '../label/label.component';

describe('Menu dropdown Component', () => {
  const hostFactory = createHostFactory<MenuDropdownComponent>({
    component: MenuDropdownComponent,
    entryComponents: [MenuItemComponent],
    declarations: [MockComponent(LabelComponent)],
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
    const actionX = noop;
    const actionY = noop;
    spectator = hostFactory(
      `
    <ht-menu-dropdown label="Settings" icon="${IconType.MoreHorizontal}">
          <ht-menu-item label="Do X" [action]="actionX"></ht-menu-item>
          <ht-menu-item label="Do Y" [action]="actionY"></ht-menu-item>
        </ht-menu-dropdown>`,
      {
        hostProps: {
          actionX: actionX,
          actionY: actionY
        }
      }
    );

    spectator.click('.trigger-content');
    const optionElements = spectator.queryAll('.menu-item', { root: true });
    expect(spectator.query('.dropdown-content', { root: true })).toExist();
    expect(optionElements.length).toBe(2);

    expect(optionElements[0]).toHaveText('Do X');
    expect(optionElements[0]).toHaveText('Do Y');
  }));

  test('should trigger corresponding action when an item is clicked', fakeAsync(() => {
    const actionX = noop;
    const actionY = noop;
    spectator = hostFactory(
      `
    <ht-menu-dropdown label="Settings" icon="${IconType.MoreHorizontal}">
          <ht-menu-item label="Do X" [action]="actionX"></ht-menu-item>
          <ht-menu-item label="Do Y" [action]="actionY"></ht-menu-item>
        </ht-menu-dropdown>`,
      {
        hostProps: {
          actionX: actionX,
          actionY: actionY
        }
      }
    );

    spectator.click('.trigger-content');
    const optionElements = spectator.queryAll('.menu-item', { root: true });
    expect(spectator.query('.dropdown-content', { root: true })).toExist();
    expect(optionElements.length).toBe(2);

    spectator.click(spectator.queryAll('.menu-item')[0] as HTMLElement);
    expect(actionX).toHaveBeenCalled();
  }));
});
