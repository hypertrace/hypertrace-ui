import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FileDisplayModule } from '../file-display/file-display.module';
import { IconModule } from '../icon/icon.module';
import { DropZoneDirective } from './drop-zone/drop-zone.directive';
import { FileUploadComponent } from './file-upload.component';

@NgModule({
  imports: [CommonModule, IconModule, FileDisplayModule, FormsModule],
  declarations: [FileUploadComponent, DropZoneDirective],
  exports: [FileUploadComponent, DropZoneDirective]
})
export class FileUploadModule {}
