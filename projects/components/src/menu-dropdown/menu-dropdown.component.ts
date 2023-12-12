import { AfterContentInit, ChangeDetectionStrategy, Component, ContentChildren, Input, QueryList } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { queryListAndChanges$ } from '@hypertrace/common';
import { Observable, of } from 'rxjs';
import { IconSize } from '../icon/icon-size';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { map } from 'rxjs/operators';

@Component({
  selector: 'ht-menu-dropdown',
  styleUrls: ['./menu-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-event-blocker event="click" [enabled]="true">
      <ht-popover [closeOnClick]="true" [disabled]="this.disabled" *ngIf="this.hasItems$ | async">
        <ht-popover-trigger>
          <div class="trigger-content" [ngClass]="{ disabled: this.disabled, labeled: !!this.label }">
            <ht-label *ngIf="this.label" class="trigger-label" [label]="this.label"></ht-label>
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
  `,
})
export class MenuDropdownComponent implements AfterContentInit {
  @Input()
  public icon?: IconType;

  @Input()
  public label?: string;

  @Input()
  public disabled: boolean = false;

  @ContentChildren(MenuItemComponent)
  public items?: QueryList<MenuItemComponent>;

  protected hasItems$: Observable<boolean> = of(false);

  public ngAfterContentInit(): void {
    if (this.items) {
      this.hasItems$ = queryListAndChanges$(this.items).pipe(map(items => items.length > 0));
    }
  }
}
