import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { IconLibraryModule } from '@hypertrace/assets-library';
import { TooltipModule } from '../tooltip/tooltip.module';
import { IconComponent } from './icon.component';

@NgModule({
  imports: [MatIconModule, CommonModule, TooltipModule, IconLibraryModule],
  declarations: [IconComponent],
  exports: [IconComponent]
})
export class IconModule {}
