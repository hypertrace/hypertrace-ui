import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { RouterModule } from '@angular/router';
import { InfoIconModule } from '../../info-icon/info-icon.module';
import { LabelTagModule } from '../../label-tag/label-tag.module';
import { TabCustomHeaderDirective } from './tab-custom-header.directive';
import { TabGroupComponent } from './tab-group.component';
import { TabComponent } from './tab/tab.component';

@NgModule({
  declarations: [TabGroupComponent, TabComponent, TabCustomHeaderDirective],
  exports: [TabGroupComponent, TabComponent, TabCustomHeaderDirective],
  imports: [MatTabsModule, CommonModule, RouterModule, LabelTagModule, InfoIconModule]
})
export class TabModule {}
