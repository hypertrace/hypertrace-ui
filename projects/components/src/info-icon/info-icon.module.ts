import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { InfoIconComponent } from './info-icon.component';

@NgModule({
  imports: [CommonModule, IconModule, TooltipModule],
  declarations: [InfoIconComponent],
  exports: [InfoIconComponent]
})
export class InfoIconModule {}
