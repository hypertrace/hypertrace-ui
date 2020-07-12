import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IconModule, TooltipModule } from '@hypertrace/components';
import { EntityRendererComponent } from './entity-renderer.component';

@NgModule({
  imports: [CommonModule, TooltipModule, IconModule],
  declarations: [EntityRendererComponent],
  exports: [EntityRendererComponent]
})
export class EntityRendererModule {}
