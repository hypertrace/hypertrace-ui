import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '../button/button.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { OpenInNewTabComponent } from './open-in-new-tab.component';

@NgModule({
  declarations: [OpenInNewTabComponent],
  exports: [OpenInNewTabComponent],
  imports: [CommonModule, ButtonModule, TooltipModule]
})
export class OpenInNewTabModule {}
