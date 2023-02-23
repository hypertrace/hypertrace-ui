import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconModule } from '../icon/icon.module';
import { SearchBoxComponent } from './search-box.component';
import { SearchModeOnSubmitIfEnabledPipe } from './search-mode-on-submit-if-feature-enabled.pipe';

@NgModule({
  imports: [CommonModule, FormsModule, IconModule],
  declarations: [SearchBoxComponent, SearchModeOnSubmitIfEnabledPipe],
  exports: [SearchBoxComponent, SearchModeOnSubmitIfEnabledPipe]
})
export class TraceSearchBoxModule {}
