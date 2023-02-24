import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LetAsyncDirective } from './let-async.directive';

@NgModule({
  declarations: [LetAsyncDirective],
  exports: [LetAsyncDirective],
  imports: [CommonModule]
})
export class LetAsyncModule {}
