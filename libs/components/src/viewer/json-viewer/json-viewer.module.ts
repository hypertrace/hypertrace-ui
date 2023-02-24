import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../../icon/icon.module';
import { JsonRecordsPipe } from './json-records.pipe';
import { JsonViewerComponent } from './json-viewer.component';

@NgModule({
  declarations: [JsonViewerComponent, JsonRecordsPipe],
  imports: [CommonModule, IconModule],
  exports: [JsonViewerComponent]
})
export class JsonViewerModule {}
