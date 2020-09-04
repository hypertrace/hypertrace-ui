import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LinkComponent } from './link.component';

@NgModule({
  declarations: [LinkComponent],
  exports: [LinkComponent],
  imports: [CommonModule]
})
export class LinkModule {}
