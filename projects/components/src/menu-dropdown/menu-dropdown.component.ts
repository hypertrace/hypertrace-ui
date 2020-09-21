import { ChangeDetectionStrategy, Component, ContentChildren, Input, QueryList } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { IconSize } from '../icon/icon-size';
import { MenuItemComponent } from './menu-item/menu-item.component';

@Component({
  selector: 'ht-menu-dropdown',
  styleUrls: ['./menu-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="menu-dropdown">
      <ht-popover [closeOnClick]="true" class="menu-container">
        <ht-popover-trigger>
          <div class="trigger-content">
            <ht-label *ngIf="this.label" class="trigger-label" [label]="this.label"> </ht-label>
            <ht-icon *ngIf="this.icon" class="trigger-icon" [icon]="this.icon" size="${IconSize.Small}"></ht-icon>
          </div>
        </ht-popover-trigger>
        <ht-popover-content>
          <div class="dropdown-content">
            <ng-content select="ht-menu-item"></ng-content>
          </div>
        </ht-popover-content>
      </ht-popover>
    </div>
  `
})
export class MenuDropdownComponent {
  @Input()
  public icon?: IconType;

  @Input()
  public label?: string;

  @ContentChildren(MenuItemComponent)
  public items?: QueryList<MenuItemComponent>;
}
