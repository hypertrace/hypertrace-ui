import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { IconModule } from '../../icon/icon.module';
import { TooltipModule } from '../../tooltip/tooltip.module';
import { FileDisplayComponent } from './file-display.component';

@NgModule({
  imports: [CommonModule, IconModule, FormattingModule, TooltipModule],
  declarations: [FileDisplayComponent],
  exports: [FileDisplayComponent]
})
export class FileDisplayModule {}
