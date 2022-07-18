import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  ButtonModule,
  FormFieldModule,
  InputModule,
  LetAsyncModule,
  SelectModule,
  TooltipModule,
  TraceCheckboxModule
} from '@hypertrace/components';
import { IntervalSelectModule } from '../interval-select/interval-select.module';
import { ExploreQueryEditorComponent } from './explore-query-editor.component';
import { ExploreQueryGroupByEditorComponent } from './group-by/explore-query-group-by-editor.component';
import { ExploreQueryIntervalEditorComponent } from './interval/explore-query-interval-editor.component';
import { ExploreQueryLimitEditorComponent } from './limit/explore-query-limit-editor.component';
import { ExploreQueryOrderByEditorComponent } from './order-by/explore-query-order-by-editor.component';
import { ExploreQuerySeriesEditorComponent } from './series/explore-query-series-editor.component';
import { ExploreQuerySeriesGroupEditorComponent } from './series/explore-query-series-group-editor.component';

@NgModule({
  declarations: [
    ExploreQueryEditorComponent,
    ExploreQuerySeriesGroupEditorComponent,
    ExploreQuerySeriesEditorComponent,
    ExploreQueryGroupByEditorComponent,
    ExploreQueryLimitEditorComponent,
    ExploreQueryIntervalEditorComponent,
    ExploreQueryOrderByEditorComponent
  ],
  exports: [ExploreQueryEditorComponent],
  imports: [
    CommonModule,
    ButtonModule,
    SelectModule,
    TooltipModule,
    InputModule,
    IntervalSelectModule,
    TraceCheckboxModule,
    LetAsyncModule,
    FormFieldModule
  ]
})
export class ExploreQueryEditorModule {}
