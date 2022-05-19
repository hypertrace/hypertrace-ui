import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '../../../common/src/public-api';
import { IconModule } from '../icon/icon.module';
import { ProgressBarModule } from '../progress-bar/progress-bar.module';
import { FileDisplayComponent } from './file-display.component';

@NgModule({
  imports: [CommonModule, IconModule, ProgressBarModule, FormattingModule],
  declarations: [FileDisplayComponent],
  exports: [FileDisplayComponent]
})
export class FileDisplayModule {}
