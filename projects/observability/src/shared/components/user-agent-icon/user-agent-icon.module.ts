import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IconModule, TooltipModule } from '@hypertrace/components';
import { UserAgentIconComponent } from './user-agent-icon.component';

@NgModule({
  imports: [CommonModule, TooltipModule, IconModule],
  declarations: [UserAgentIconComponent],
  exports: [UserAgentIconComponent]
})
export class UserAgentIconModule {}
