import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../../icon/icon.module';
import { SelectModule } from '../../select/select.module';
import { TimeRangeModule } from '../../time-range/time-range.module';
import { ApplicationHeaderComponent } from './application-header.component';

@NgModule({
  imports: [CommonModule, IconModule, SelectModule, TimeRangeModule],
  declarations: [ApplicationHeaderComponent],
  exports: [ApplicationHeaderComponent]
})
export class ApplicationHeaderModule {}
