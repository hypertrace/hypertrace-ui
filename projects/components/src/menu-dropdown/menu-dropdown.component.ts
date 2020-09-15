import { ChangeDetectionStrategy, Component, ContentChildren, Input, OnInit, QueryList } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { IconSize } from '../icon/icon-size';
import { MenuItemComponent } from './menu-item.component';

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
            <div *ngFor="let item of items" (click)="item.action()" class="menu-item">
              <ht-icon
                class="icon"
                *ngIf="item.icon"
                [icon]="item.icon"
                size="${IconSize.Small}"
                [color]="item.iconColor"
              ></ht-icon>
              <span class="label">{{ item.label }}</span>
            </div>
          </div>
        </ht-popover-content>
      </ht-popover>
    </div>
  `
})
export class MenuDropdownComponent implements OnInit {
  @Input()
  public icon?: IconType;

  @Input()
  public label?: string;

  @ContentChildren(MenuItemComponent)
  public items?: QueryList<MenuItemComponent>;

  public ngOnInit(): void {}
}
