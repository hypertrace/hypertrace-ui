import { NgModule } from '@angular/core';
import { LabelTagModule } from '../label-tag/label-tag.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { BetaTagComponent } from './beta-tag.component';

@NgModule({
  declarations: [BetaTagComponent],
  imports: [LabelTagModule, TooltipModule],
  exports: [BetaTagComponent]
})
export class BetaTagModule {}
