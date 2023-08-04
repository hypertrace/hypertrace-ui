import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IsEmptyPipeModule } from '@hypertrace/common';
import { IconModule } from '../icon/icon.module';
import { SearchBoxComponent } from './search-box.component';
import { EventBlockerModule } from '../event-blocker/event-blocker.module';

@NgModule({
  imports: [CommonModule, EventBlockerModule, FormsModule, IconModule, IsEmptyPipeModule],
  declarations: [SearchBoxComponent],
  exports: [SearchBoxComponent]
})
export class TraceSearchBoxModule {}
