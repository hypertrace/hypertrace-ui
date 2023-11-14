import { NgModule } from '@angular/core';
import { ButtonModule } from '../public-api';
import { BackButtonComponent } from './back-button.component';

@NgModule({
  imports: [ButtonModule],
  declarations: [BackButtonComponent],
  exports: [BackButtonComponent],
})
export class BackButtonModule {}
