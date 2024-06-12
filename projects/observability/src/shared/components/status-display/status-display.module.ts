import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormattingModule, MemoizeModule } from '@hypertrace/common';
import { IconModule } from '@hypertrace/components';
import { StatusDisplayIconPipe } from './status-display-icon.pipe';
import { StatusDisplayTextPipe } from './status-display-text.pipe';
import { StatusDisplayComponent } from './status-display.component';

@NgModule({
  imports: [IconModule, MemoizeModule, CommonModule, FormattingModule],
  exports: [StatusDisplayComponent],
  declarations: [StatusDisplayComponent, StatusDisplayTextPipe, StatusDisplayIconPipe]
})
export class StatusDisplayModule {}
