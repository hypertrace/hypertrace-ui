import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconModule } from '../icon/icon.module';
import { SearchBoxComponent } from './search-box.component';

@NgModule({
  imports: [CommonModule, FormsModule, IconModule],
  declarations: [SearchBoxComponent],
  exports: [SearchBoxComponent]
})
export class TraceSearchBoxModule {}
