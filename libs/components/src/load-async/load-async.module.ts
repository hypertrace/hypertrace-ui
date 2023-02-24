import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { MessageDisplayModule } from '../message-display/message-display.module';
import { LoadAsyncDirective } from './load-async.directive';
import { LoaderModule } from './loader/loader.module';
import { LoadAsyncWrapperComponent } from './wrapper/load-async-wrapper.component';

@NgModule({
  declarations: [LoadAsyncDirective, LoadAsyncWrapperComponent],
  imports: [CommonModule, IconModule, MessageDisplayModule, LoaderModule],
  exports: [LoadAsyncDirective]
})
export class LoadAsyncModule {}
