import { NgModule } from '@angular/core';
import { ButtonModule } from '../button/button.module';
import { NotFoundComponent } from './not-found.component';

@NgModule({
  declarations: [NotFoundComponent],
  imports: [ButtonModule]
})
export class NotFoundModule {}
