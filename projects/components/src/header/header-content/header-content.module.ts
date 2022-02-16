import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HeaderContentPrimaryDirective } from './header-content-primary.directive';
import { HeaderContentSecondaryDirective } from './header-content-secondary.directive';

@NgModule({
  declarations: [HeaderContentPrimaryDirective, HeaderContentSecondaryDirective],
  exports: [HeaderContentPrimaryDirective, HeaderContentSecondaryDirective],
  imports: [CommonModule],
  providers: []
})
export class HeaderContentModule {}
