import { NgModule } from '@angular/core';
import { IconModule } from '../../icon/icon.module';
import { SelectModule } from '../../select/select.module';
import { TimeRangeModule } from '../../time-range/time-range.module';
import { SpaceSelectorComponent } from '../space-selector/space-selector.component';
import { ApplicationHeaderComponent } from './application-header.component';

@NgModule({
  imports: [IconModule, SelectModule, TimeRangeModule],
  declarations: [ApplicationHeaderComponent, SpaceSelectorComponent],
  exports: [ApplicationHeaderComponent]
})
export class ApplicationHeaderModule {}
