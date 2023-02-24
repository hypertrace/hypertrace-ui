import { NgModule } from '@angular/core';
import { ExtractValuesPipe } from './extract-values.pipe';

@NgModule({
  declarations: [ExtractValuesPipe],
  exports: [ExtractValuesPipe]
})
export class ExtractValuesPipeModule {}
