import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ProgressBarComponent } from './progress-bar.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ProgressBarComponent],
  exports: [ProgressBarComponent]
})
export class ProgressBarModule {}
