import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { NgModule } from '@angular/core';
import { MemoizeModule } from '@hypertrace/common';
import { ButtonModule } from '../button/button.module';
import { RefreshButtonComponent } from './refresh-button.component';

@NgModule({
  declarations: [RefreshButtonComponent],
  exports: [RefreshButtonComponent],
  imports: [AsyncPipe, ButtonModule, MemoizeModule, NgIf, NgClass],
})
export class RefreshButtonModule {}
