import { IconType } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { LabelComponent } from '../label/label.component';
import { PopoverComponent } from '../popover/popover.component';
import { EventBlockerModule } from './../event-blocker/event-blocker.module';
import { MenuDropdownComponent } from './menu-dropdown.component';
import { MenuItemComponent } from './menu-item/menu-item.component';

describe('Menu dropdown Component', () => {
  const createHost = createHostFactory<MenuDropdownComponent>({
    component: MenuDropdownComponent,
    imports: [EventBlockerModule],
    declarations: [MockComponent(LabelComponent), MockComponent(MenuItemComponent), MockComponent(PopoverComponent)],
    shallow: true,
    providers: [
      mockProvider(NavigationService, {
        navigation$: of(true)
      })
    ]
  });

  let spectator: SpectatorHost<MenuDropdownComponent>;

  test('should display trigger content as expected', () => {
    spectator = createHost(
      `
    <ht-menu-dropdown label="Settings" icon="${IconType.MoreHorizontal}">
        </ht-menu-dropdown>`
    );

    expect(spectator.query('.trigger-content')).toExist();
    expect(spectator.query('.trigger-label')).toExist();
    expect(spectator.query('.trigger-icon')).toExist();
  });

  test('should display menu items as popovercontent', () => {
    spectator = createHost(
      `<ht-menu-dropdown label="Settings" icon="${IconType.MoreHorizontal}">
          <ht-menu-item label="Do X"></ht-menu-item>
          <ht-menu-item label="Do Y"></ht-menu-item>
        </ht-menu-dropdown>`
    );

    expect(spectator.queryAll(MenuItemComponent).map(component => component.label)).toEqual(['Do X', 'Do Y']);
  });

  test('should mark popover as disabled when disabled', () => {
    spectator = createHost(
      `<ht-menu-dropdown label="Settings" icon="${IconType.MoreHorizontal}" [disabled]="true">
          <ht-menu-item label="Do X"></ht-menu-item>
          <ht-menu-item label="Do Y"></ht-menu-item>
        </ht-menu-dropdown>`
    );

    expect(spectator.query(PopoverComponent)?.disabled).toBe(true);
  });

  test('should not bubble event from trigger element', () => {
    const onClickSpy = jest.fn();

    spectator = createHost(
      `
    <ht-menu-dropdown label="Settings" icon="${IconType.MoreHorizontal}" (click)="onClick()">
          <ht-menu-item label="Do X"></ht-menu-item>
          <ht-menu-item label="Do Y"></ht-menu-item>
        </ht-menu-dropdown>`,
      {
        hostProps: {
          onClick: onClickSpy
        }
      }
    );

    spectator.click('.trigger-content');

    expect(onClickSpy).not.toHaveBeenCalled();
  });
});
