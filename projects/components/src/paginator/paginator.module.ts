import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '../button/button.module';
import { LabelModule } from '../label/label.module';
import { SelectModule } from '../select/select.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { PaginatorComponent } from './paginator.component';

@NgModule({
  declarations: [PaginatorComponent],
  imports: [CommonModule, SelectModule, LabelModule, ButtonModule, TooltipModule],
  exports: [PaginatorComponent]
})
export class PaginatorModule {}
