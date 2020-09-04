import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { FeatureConfigCheckModule } from '../../feature-check/feature-config-check.module';
import { LetAsyncModule } from '../../let-async/let-async.module';
import { NavigableTabGroupComponent } from './navigable-tab-group.component';
import { NavigableTabComponent } from './navigable-tab.component';

@NgModule({
  declarations: [NavigableTabGroupComponent, NavigableTabComponent],
  exports: [NavigableTabGroupComponent, NavigableTabComponent],
  imports: [MatTabsModule, CommonModule, RouterModule, LetAsyncModule, FeatureConfigCheckModule]
})
export class NavigableTabModule {}
