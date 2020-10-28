import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '@hypertrace/components';
import { ExplorerFilterOnHoverComponent } from './explorer-filter-on-hover.component';
import { ExplorerFilterOnHoverDirective } from './explorer-filter-on-hover.directive';

@NgModule({
  declarations: [ExplorerFilterOnHoverDirective, ExplorerFilterOnHoverComponent],
  imports: [CommonModule, IconModule],
  exports: [ExplorerFilterOnHoverDirective]
})
export class ExplorerFilterOnHoverModule {}
