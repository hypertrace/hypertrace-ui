import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { IconModule } from '../../icon/icon.module';
import { LoaderModule } from '../../load-async/loader/loader.module';
import { TooltipModule } from '../../tooltip/tooltip.module';
import { ProgressBarModule } from './../../progress-bar/progress-bar.module';
import { FileDisplayComponent } from './file-display.component';

@NgModule({
  imports: [CommonModule, IconModule, FormattingModule, TooltipModule, LoaderModule, ProgressBarModule],
  declarations: [FileDisplayComponent],
  exports: [FileDisplayComponent],
})
export class FileDisplayModule {}
