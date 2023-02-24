import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  FeatureConfigCheckModule,
  IconModule,
  LayoutChangeModule,
  LetAsyncModule,
  NavigationListModule
} from '@hypertrace/components';
import { NavigationComponent } from './navigation.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    IconModule,
    LayoutChangeModule,
    LetAsyncModule,
    FeatureConfigCheckModule,
    NavigationListModule
  ],
  declarations: [NavigationComponent],
  exports: [NavigationComponent]
})
export class NavigationModule {}
