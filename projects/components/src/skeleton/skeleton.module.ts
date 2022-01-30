import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { SkeletonComponent } from './skeleton.component';

@NgModule({
  declarations: [SkeletonComponent],
  imports: [CommonModule, IconModule],
  exports: [SkeletonComponent]
})
export class SkeletonModule {}
