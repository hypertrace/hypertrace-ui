import { NgModule } from '@angular/core';
import { SkeletonComponent } from './skeleton.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [SkeletonComponent],
  imports: [CommonModule],
  exports: [SkeletonComponent]
})
export class SkeletonModule {}
