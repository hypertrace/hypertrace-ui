import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { MessageDisplayModule } from '../message-display/message-display.module';
import { SkeletonModule } from '../skeleton/skeleton.module';
import { LoadAsyncDirective } from './load-async.directive';
import { LoaderComponent } from './loader/loader.component';
import { LoadAsyncWrapperComponent } from './wrapper/load-async-wrapper.component';

@NgModule({
  declarations: [LoadAsyncDirective, LoadAsyncWrapperComponent, LoaderComponent],
  imports: [CommonModule, IconModule, MessageDisplayModule, SkeletonModule],
  exports: [LoadAsyncDirective]
})
export class LoadAsyncModule {}
