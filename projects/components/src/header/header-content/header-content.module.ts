import { NgModule } from '@angular/core';

import { HeaderContentPrimary } from './header-content-primary.directive';
import { HeaderContentSecondary } from './header-content-secondary.directive';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [HeaderContentPrimary, HeaderContentSecondary],
  exports: [HeaderContentPrimary, HeaderContentSecondary],
  imports: [CommonModule],
  providers: []
})
export class HeaderContentModule {}
