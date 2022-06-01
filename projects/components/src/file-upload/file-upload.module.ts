import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconModule } from '../icon/icon.module';
import { ProgressBarModule } from '../progress-bar/progress-bar.module';
import { DropZoneDirective } from './drop-zone/drop-zone.directive';
import { FileDisplayModule } from './file-display/file-display.module';
import { FileUploadComponent } from './file-upload.component';

@NgModule({
  imports: [CommonModule, IconModule, FileDisplayModule, FormsModule, ProgressBarModule],
  declarations: [FileUploadComponent, DropZoneDirective],
  exports: [FileUploadComponent, DropZoneDirective]
})
export class FileUploadModule {}
