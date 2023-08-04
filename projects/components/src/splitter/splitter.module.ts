import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SplitterComponent } from './splitter.component';
import { SplitterContentDirective } from './splitter-content.directive';
import { MemoizeModule } from '@hypertrace/common';

@NgModule({
  imports: [CommonModule, MemoizeModule],
  declarations: [SplitterComponent, SplitterContentDirective],
  exports: [SplitterComponent, SplitterContentDirective]
})
export class SplitterModule {}
