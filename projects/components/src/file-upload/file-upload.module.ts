import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { IconModule } from '../icon/icon.module';
import { DropZoneDirective } from './drop-zone/drop-zone.directive';
import { FileUploadComponent } from './file-upload.component';
import { FileDisplayModule } from '../file-display/file-display.module';

@NgModule({
  imports: [CommonModule, FormattingModule, IconModule, FileDisplayModule],
  declarations: [FileUploadComponent, DropZoneDirective],
  exports: [FileUploadComponent, DropZoneDirective]
})
export class FileUploadModule {}
