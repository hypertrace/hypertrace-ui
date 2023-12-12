import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../../icon/icon.module';
import { SkeletonModule } from '../../skeleton/skeleton.module';
import { LoaderComponent } from './loader.component';

@NgModule({
  declarations: [LoaderComponent],
  imports: [CommonModule, IconModule, SkeletonModule],
  exports: [LoaderComponent],
})
export class LoaderModule {}
