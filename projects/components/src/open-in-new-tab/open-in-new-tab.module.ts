import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { LinkModule } from '../link/link.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { OpenInNewTabComponent } from './open-in-new-tab.component';
import { EventBlockerModule } from '../event-blocker/event-blocker.module';

@NgModule({
  declarations: [OpenInNewTabComponent],
  exports: [OpenInNewTabComponent],
  imports: [CommonModule, TooltipModule, LinkModule, IconModule, EventBlockerModule]
})
export class OpenInNewTabModule {}
