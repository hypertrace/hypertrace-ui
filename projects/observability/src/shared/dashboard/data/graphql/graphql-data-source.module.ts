import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { GraphQlModule } from '@hypertrace/graphql-client';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { TableWidgetColumnModel } from '../../widgets/table/table-widget-column.model';
import { GraphQlFilterDataSourceModel } from './filter/graphql-filter-data-source.model';
import { GraphqlIdScopeFilterModel } from './filter/graphql-id-scope-filter.model';
import { GraphQlKeyValueFilterModel } from './filter/graphql-key-value-filter.model';
import { GRAPHQL_DATA_SOURCE_HANDLER_PROVIDERS } from './graphql-handler-configuration';
import { SpanDataSourceModel } from './span/span-data-source.model';
import { AttributeSpecificationModel } from './specifiers/attribute-specification.model';
import { CompositeSpecificationModel } from './specifiers/composite-specification.model';
import { EnrichedAttributeSpecificationModel } from './specifiers/enriched-attribute-specification.model';
import { MappedAttributeSpecificationModel } from './specifiers/mapped-attribute-specification.model';
import { TraceStatusSpecificationModel } from './specifiers/trace-status-specification.model';
import { SpansTableDataSourceModel } from './table/spans/spans-table-data-source.model';
import { TracesTableDataSourceModel } from './table/traces/traces-table-data-source.model';
import { TraceDataSourceModel } from './trace/trace-data-source.model';
import { TracesDataSourceModel } from './trace/traces-data-source.model';
import { TraceWaterfallDataSourceModel } from './waterfall/trace-waterfall-data-source.model';

@NgModule({
  imports: [
    HttpClientModule,
    GraphQlModule.withHandlerProviders(GRAPHQL_DATA_SOURCE_HANDLER_PROVIDERS),
    DashboardCoreModule.with({
      models: [
        TraceWaterfallDataSourceModel,
        GraphQlFilterDataSourceModel,
        GraphQlKeyValueFilterModel,
        GraphqlIdScopeFilterModel,
        SpansTableDataSourceModel,
        TracesTableDataSourceModel,
        SpanDataSourceModel,
        TableWidgetColumnModel,
        TraceDataSourceModel,
        TracesDataSourceModel,
        CompositeSpecificationModel,
        AttributeSpecificationModel,
        TraceStatusSpecificationModel,
        EnrichedAttributeSpecificationModel,
        MappedAttributeSpecificationModel
      ]
    })
  ]
})
export class GraphQlDataSourceModule {}
