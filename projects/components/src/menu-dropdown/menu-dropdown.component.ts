import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList
} from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Observable } from 'rxjs';
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
            <div *ngFor="let item of items" (click)="this.onMenuItemClick(item)" class="menu-item">
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
export class MenuDropdownComponent {
  @Input()
  public icon?: IconType;

  @Input()
  public label?: string;

  @ContentChildren(MenuItemComponent)
  public items?: QueryList<MenuItemComponent>;

  @Output()
  public output: EventEmitter<() => Observable<any>> = new EventEmitter();

  public onMenuItemClick(item: MenuItemComponent): void {
    this.output.emit(item.action);
  }
}
