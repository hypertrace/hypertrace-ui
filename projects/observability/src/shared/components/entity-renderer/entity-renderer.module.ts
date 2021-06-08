import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';

import { IconModule, LinkModule, TooltipModule } from '@hypertrace/components';
import { EntityRendererComponent } from './entity-renderer.component';

@NgModule({
  imports: [CommonModule, TooltipModule, IconModule, LinkModule, FormattingModule],
  declarations: [EntityRendererComponent],
  exports: [EntityRendererComponent]
})
export class EntityRendererModule {}
