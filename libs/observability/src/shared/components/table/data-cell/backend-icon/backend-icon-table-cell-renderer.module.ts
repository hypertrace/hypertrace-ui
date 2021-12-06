import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '@hypertrace/components';
import { ObservabilityIconLibraryModule } from '../../../../icons/observability-icon-library.module';
import { BackendIconTableCellRendererComponent } from './backend-icon-table-cell-renderer.component';

@NgModule({
  imports: [CommonModule, IconModule, ObservabilityIconLibraryModule],
  declarations: [BackendIconTableCellRendererComponent],
  exports: [BackendIconTableCellRendererComponent]
})
export class BackendIconTableCellRendererModule {}
