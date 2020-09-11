import { NgModule } from '@angular/core';
import { LabelTagModule } from '../label-tag/label-tag.module';
import { BetaTagComponent } from './beta-tag.component';

@NgModule({
  declarations: [BetaTagComponent],
  imports: [LabelTagModule],
  exports: [BetaTagComponent]
})
export class BetaTagModule {}
