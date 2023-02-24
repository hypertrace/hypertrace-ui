import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SkeletonComponent } from './skeleton.component';

@NgModule({
  declarations: [SkeletonComponent],
  imports: [CommonModule],
  exports: [SkeletonComponent]
})
export class SkeletonModule {}
