import { NgModule } from '@angular/core';
import { IsEmptyPipe } from 'projects/common/src/utilities/angular/pipes/is-empty/is-empty.pipe';

@NgModule({
  declarations: [IsEmptyPipe],
  exports: [IsEmptyPipe]
})
export class IsEmptyPipeModule {}
