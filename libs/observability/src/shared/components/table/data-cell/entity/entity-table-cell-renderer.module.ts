import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EntityRendererModule } from '../../../entity-renderer/entity-renderer.module';
import { EntityTableCellRendererComponent } from './entity-table-cell-renderer.component';

@NgModule({
  imports: [CommonModule, EntityRendererModule],
  declarations: [EntityTableCellRendererComponent],
  exports: [EntityTableCellRendererComponent]
})
export class EntityTableCellRendererModule {}
