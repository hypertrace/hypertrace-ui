import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ConditionalWidgetModule } from './conditional/conditional-widget.module';
import { ContainerWidgetModule } from './container/container-widget.module';
import { DividerWidgetModule } from './divider/divider-widget.module';
import { GreetingLabelWidgetModule } from './greeting-label/greeting-label-widget.module';
import { HighlightedLabelWidgetModule } from './highlighted-label/highlighted-label-widget.module';
import { JsonWidgetModule } from './json-widget/json-widget.module';
import { RepeatModule } from './repeat/repeat.module';
import { TextWidgetModule } from './text/text-widget.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ContainerWidgetModule,
    DividerWidgetModule,
    HighlightedLabelWidgetModule,
    JsonWidgetModule,
    RepeatModule,
    TextWidgetModule,
    GreetingLabelWidgetModule,
    ConditionalWidgetModule
  ]
})
export class DashboardWidgetsModule {}
