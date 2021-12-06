import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { LabelTagModule } from '../../label-tag/label-tag.module';
import { TabGroupComponent } from './tab-group.component';
import { TabComponent } from './tab/tab.component';

@NgModule({
  declarations: [TabGroupComponent, TabComponent],
  exports: [TabGroupComponent, TabComponent],
  imports: [MatTabsModule, CommonModule, RouterModule, LabelTagModule]
})
export class TabModule {}
