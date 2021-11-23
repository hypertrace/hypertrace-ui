import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule, DividerModule } from '@hypertrace/components';
import { CartesianExplorerContextMenuComponent } from './cartesian-explorer-context-menu.component';

@NgModule({
  imports: [CommonModule, DividerModule, ButtonModule],
  declarations: [CartesianExplorerContextMenuComponent],
  exports: [CartesianExplorerContextMenuComponent]
})
export class CartesianExplorerContextMenuModule {}
