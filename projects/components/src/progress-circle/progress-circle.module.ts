import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ProgressCircleComponent } from './progress-circle.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ProgressCircleComponent],
  exports: [ProgressCircleComponent]
})
export class ProgressCircleModule {}
