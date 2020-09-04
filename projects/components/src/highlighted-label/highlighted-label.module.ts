import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HighlightedLabelComponent } from './highlighted-label.component';

@NgModule({
  declarations: [HighlightedLabelComponent],
  imports: [CommonModule],
  exports: [HighlightedLabelComponent]
})
export class HighlightedLabelModule {}
