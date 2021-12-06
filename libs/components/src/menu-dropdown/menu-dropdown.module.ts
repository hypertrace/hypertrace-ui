import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EventBlockerModule } from '../event-blocker/event-blocker.module';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../label/label.module';
import { PopoverModule } from '../popover/popover.module';
import { MenuDropdownComponent } from './menu-dropdown.component';
import { MenuItemComponent } from './menu-item/menu-item.component';

@NgModule({
  declarations: [MenuDropdownComponent, MenuItemComponent],
  imports: [CommonModule, PopoverModule, IconModule, LabelModule, EventBlockerModule],
  exports: [MenuDropdownComponent, MenuItemComponent]
})
export class MenuDropdownModule {}
