import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { EventBlockerModule } from './../event-blocker/event-blocker.module';
import { CollapsibleSidebarComponent } from './collapsible-sidebar.component';

@NgModule({
  imports: [CommonModule, IconModule, EventBlockerModule],
  declarations: [CollapsibleSidebarComponent],
  exports: [CollapsibleSidebarComponent],
})
export class CollapsibleSidebarModule {}
