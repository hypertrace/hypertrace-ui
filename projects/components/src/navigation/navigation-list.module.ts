import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from '../button/button.module';
import { FeatureConfigCheckModule } from '../feature-check/feature-config-check.module';
import { IconModule } from '../icon/icon.module';
import { LabelTagModule } from '../label-tag/label-tag.module';
import { LabelModule } from '../label/label.module';
import { LayoutChangeModule } from '../layout/layout-change.module';
import { LetAsyncModule } from '../let-async/let-async.module';
import { LinkModule } from '../link/link.module';
import { NavItemComponent } from './nav-item/nav-item.component';
import { NavigationListComponent } from './navigation-list.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    IconModule,
    LayoutChangeModule,
    LetAsyncModule,
    FeatureConfigCheckModule,
    ButtonModule,
    LinkModule,
    LabelModule,
    LabelTagModule
  ],
  declarations: [NavigationListComponent, NavItemComponent],
  exports: [NavigationListComponent]
})
export class NavigationListModule {}
