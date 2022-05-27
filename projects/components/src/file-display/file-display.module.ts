import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { IconModule } from '../icon/icon.module';
import { ProgressBarModule } from '../progress-bar/progress-bar.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { FileDisplayComponent } from './file-display.component';

@NgModule({
  imports: [CommonModule, IconModule, ProgressBarModule, FormattingModule, TooltipModule],
  declarations: [FileDisplayComponent],
  exports: [FileDisplayComponent]
})
export class FileDisplayModule {}
