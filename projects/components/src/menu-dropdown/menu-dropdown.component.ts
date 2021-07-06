import { ChangeDetectionStrategy, Component, ContentChildren, Input, QueryList } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { IconSize } from '../icon/icon-size';
import { MenuItemComponent } from './menu-item/menu-item.component';

@Component({
  selector: 'ht-menu-dropdown',
  styleUrls: ['./menu-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-event-blocker event="click" [enabled]="true">
      <ht-popover [closeOnClick]="true" [disabled]="this.disabled" *ngIf="this.items?.length > 0">
        <ht-popover-trigger>
          <div class="trigger-content" [ngClass]="{ disabled: this.disabled, labeled: !!this.label }">
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
    </ht-event-blocker>
  `
})
export class MenuDropdownComponent {
  @Input()
  public icon?: IconType;

  @Input()
  public label?: string;

  @Input()
  public disabled: boolean = false;

  @ContentChildren(MenuItemComponent)
  public items?: QueryList<MenuItemComponent>;
}
