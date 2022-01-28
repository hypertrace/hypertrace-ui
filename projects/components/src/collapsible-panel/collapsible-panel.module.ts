import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CollapsiblePanelBodyComponent } from './collapsible-panel-body.component';
import { CollapsiblePanelHeaderComponent } from './collapsible-panel-header.component';
import { CollapsiblePanelToggleDirective } from './collapsible-panel-toggle.directive';
import { CollapsiblePanelComponent } from './collapsible-panel.component';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../label/label.module';

@NgModule({
  declarations: [
    CollapsiblePanelComponent,
    CollapsiblePanelBodyComponent,
    CollapsiblePanelHeaderComponent,
    CollapsiblePanelToggleDirective
  ],
  imports: [CommonModule, IconModule, LabelModule],
  exports: [
    CollapsiblePanelComponent,
    CollapsiblePanelBodyComponent,
    CollapsiblePanelHeaderComponent,
    CollapsiblePanelToggleDirective
  ]
})
export class CollapsiblePanelModule {}
