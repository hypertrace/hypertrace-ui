import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { DropZoneDirective } from './drop-zone/drop-zone.directive';
import { FileUploadComponent } from './file-upload.component';

@NgModule({
  imports: [CommonModule, IconModule],
  declarations: [FileUploadComponent, DropZoneDirective],
  exports: [FileUploadComponent, DropZoneDirective]
})
export class FileUploadModule {}
