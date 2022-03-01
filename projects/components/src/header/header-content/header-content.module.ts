import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HeaderPrimaryRowContentDirective } from './header-primary-row-content.directive';
import { HeaderSecondaryRowContentDirective } from './header-secondary-row-content.directive';
@NgModule({
  declarations: [HeaderPrimaryRowContentDirective, HeaderSecondaryRowContentDirective],
  exports: [HeaderPrimaryRowContentDirective, HeaderSecondaryRowContentDirective],
  imports: [CommonModule],
  providers: []
})
export class HeaderContentModule {}
