/* eslint-disable max-lines */
import { Injectable, InjectionToken } from '@angular/core';
import { isEqualIgnoreFunctions } from '@hypertrace/common';
import {
  CoreTableCellRendererType,
  FilterBuilderLookupService,
  TableMode,
  TableSortDirection,
  TableStyle,
} from '@hypertrace/components';
import { Dashboard, ModelJson } from '@hypertrace/hyperdash';
import { Observable, of, ReplaySubject, Subject } from 'rxjs';
import { distinctUntilChanged, map, switchMap, take } from 'rxjs/operators';
import { ExploreVisualizationRequest } from '../../shared/components/explore-query-editor/explore-visualization-builder';
import { LegendPosition } from '../../shared/components/legend/legend.component';
import { ObservabilityTableCellType } from '../../shared/components/table/observability-table-cell-type';
import { TracingTableCellType } from '../../shared/components/table/tracing-table-cell-type';
import { ExplorerVisualizationCartesianDataSourceModel } from '../../shared/dashboard/data/graphql/explorer-visualization/explorer-visualization-cartesian-data-source.model';
import { GraphQlFilterDataSourceModel } from '../../shared/dashboard/data/graphql/filter/graphql-filter-data-source.model';
import {
  AttributeMetadata,
  AttributeMetadataType,
  toFilterAttributeType,
} from '../../shared/graphql/model/metadata/attribute-metadata';
import { GraphQlFilter } from '../../shared/graphql/model/schema/filter/graphql-filter';
import { ObservabilityTraceType } from '../../shared/graphql/model/schema/observability-traces';
import { SPAN_SCOPE } from '../../shared/graphql/model/schema/span';
import { MetadataService } from '../../shared/services/metadata/metadata.service';
import { isEmpty, uniqBy } from 'lodash-es';
import { ScaleType } from '../../shared/components/cartesian/chart';
import { Specification } from '../../shared/graphql/model/schema/specifier/specification';

@Injectable()
export class ExplorerDashboardBuilder {
  private readonly requestSubject: Subject<ExploreVisualizationRequest> = new ReplaySubject(1);

  public readonly visualizationDashboard$: Observable<ExplorerGeneratedDashboard>;
  public readonly resultsDashboard$: Observable<ExplorerGeneratedDashboard>;

  public constructor(
    private readonly metadataService: MetadataService,
    private readonly filterBuilderLookupService: FilterBuilderLookupService,
  ) {
    // We only want to rebuild a dashboard if we actually have a meaningful request change
    const uniqueRequests$ = this.requestSubject.pipe(distinctUntilChanged(isEqualIgnoreFunctions));

    this.visualizationDashboard$ = uniqueRequests$.pipe(
      switchMap(request => this.buildVisualizationDashboard(request)),
    );

    // Two step process so we can see if the trace request will ultimately be any different
    this.resultsDashboard$ = uniqueRequests$.pipe(
      switchMap(request => this.buildDashboardData(request)),
      distinctUntilChanged(isEqualIgnoreFunctions),
      map(data => this.buildResultsDashboard(data)),
    );
  }

  public updateForRequest(request: ExploreVisualizationRequest): void {
    this.requestSubject.next(request);
  }

  protected buildVisualizationDashboard(request: ExploreVisualizationRequest): Observable<ExplorerGeneratedDashboard> {
    return of({
      json: {
        type: 'cartesian-widget',
        'selectable-interval': false,
        'series-from-data': true,
        'legend-position': LegendPosition.Bottom,
        'show-y-axis': true,
        'selection-handler': {
          type: 'cartesian-explorer-selection-handler',
          'show-context-menu': false,
        },
        ...this.buildXAxis(request),
      },
      onReady: dashboard => {
        dashboard.createAndSetRootDataFromModelClass(ExplorerVisualizationCartesianDataSourceModel);
        const dataSource = dashboard.getRootDataSource<ExplorerVisualizationCartesianDataSourceModel>()!;
        dataSource.request = request;
      },
    });
  }

  public buildResultsDashboard(dashboardData: ResultsDashboardData): ExplorerGeneratedDashboard {
    return {
      json: dashboardData.json,

      onReady: dashboard => {
        const rootDataSource = dashboard.getRootDataSource<GraphQlFilterDataSourceModel>();
        rootDataSource && rootDataSource.clearFilters().addFilters(...dashboardData.filters);
      },
    };
  }

  private buildDashboardData(request: ExploreVisualizationRequest): Observable<ResultsDashboardData> {
    return request.resultsQuery$.pipe(
      switchMap(resultsQuery =>
        this.metadataService.getSelectionAttributes(request.context).pipe(
          take(1),
          map(attributes => [
            ...this.getDefaultTableColumns(request.context),
            ...this.getGeneratedTableColumns(attributes, request.context, resultsQuery.specifications),
          ]),
          map(columnsMetadata => this.removeDuplicatedColumns(columnsMetadata)),
          map(columnsMetadata => this.buildColumnModelJson(request.context, columnsMetadata)),
          map(json => ({
            json: json,
            filters: resultsQuery.filters || [],
          })),
        ),
      ),
    );
  }

  protected buildColumnModelJson(context: string, columns: ModelJson[]): ModelJson {
    if (context === SPAN_SCOPE) {
      return {
        type: 'table-widget',
        id: 'explorer.spans-table',
        mode: TableMode.Detail,
        style: TableStyle.FullPage,
        columns: columns,
        'child-template': {
          type: 'span-detail-widget',
          data: {
            type: 'span-detail-data-source',

            span: '${row}',
          },
        },
        data: {
          type: 'spans-table-data-source',
          trace: context,
        },
      };
    }

    return {
      type: 'table-widget',
      id: 'explorer.traces-table',
      mode: TableMode.Detail,
      style: TableStyle.Embedded,
      columns: columns,
      'child-template': {
        type: 'trace-detail-widget',
        data: {
          type: 'api-trace-detail-data-source',

          trace: '${row}',
          attributes: ['requestUrl'],
        },
      },
      data: {
        type: 'traces-table-data-source',
        trace: context,
      },
    };
  }

  private buildXAxis(request: ExploreVisualizationRequest): object {
    if (isEmpty(request.interval)) {
      if (isEmpty(request.groupBy)) {
        return {
          'x-axis': {
            type: 'cartesian-axis',
            'scale-type': ScaleType.Band,
            'show-tick-labels': false,
          },
        };
      } else {
        return {
          'x-axis': {
            type: 'cartesian-axis',
            'scale-type': ScaleType.Band,
          },
        };
      }
    }

    return {};
  }

  private getRendererForType(type: AttributeMetadataType): string {
    switch (type) {
      case AttributeMetadataType.Long:
      case AttributeMetadataType.Double:
        return CoreTableCellRendererType.Number;
      case AttributeMetadataType.Timestamp:
        return CoreTableCellRendererType.Timestamp;
      default:
        return CoreTableCellRendererType.Text;
    }
  }

  protected getDefaultTableColumns(context: string): SpecificationBackedColumnModelJson[] {
    switch (context) {
      case ObservabilityTraceType.Api:
        return [
          {
            type: 'table-widget-column',
            title: 'Type',
            width: '100px',
            display: CoreTableCellRendererType.Text,
            filterable: true,
            value: {
              type: ValueSpecificationType.Attribute,
              attribute: 'protocol',
            },
            'click-handler': {
              type: 'api-trace-navigation-handler',
            },
          },
          {
            type: 'table-widget-column',
            title: 'Service',
            width: 2,
            filterable: true,
            value: {
              type: ValueSpecificationType.Attribute,
              attribute: 'serviceName',
            },
            'click-handler': {
              type: 'api-trace-navigation-handler',
            },
          },
          {
            type: 'table-widget-column',
            title: 'Endpoint',
            width: 2,
            filterable: true,
            value: {
              type: ValueSpecificationType.Attribute,
              attribute: 'apiName',
            },
            'click-handler': {
              type: 'api-trace-navigation-handler',
            },
          },
          {
            type: 'table-widget-column',
            title: 'Exit Calls',
            filterable: false,
            display: ObservabilityTableCellType.ExitCalls,
            value: {
              type: ValueSpecificationType.Composite,
              specifications: [
                {
                  type: ValueSpecificationType.Attribute,
                  attribute: 'apiExitCalls',
                },
                {
                  type: ValueSpecificationType.Attribute,
                  attribute: 'apiCalleeNameCount',
                },
              ],
              'order-by': 'apiExitCalls',
            },
            'click-handler': {
              type: 'api-trace-navigation-handler',
            },
          },
          {
            type: 'table-widget-column',
            title: 'Status',
            width: '184px',
            display: TracingTableCellType.TraceStatus,
            filterable: true,
            value: {
              type: ValueSpecificationType.Status,
            },
            'click-handler': {
              type: 'api-trace-navigation-handler',
            },
          },
          {
            type: 'table-widget-column',
            title: 'Errors',
            width: '100px',
            filterable: true,
            value: {
              type: ValueSpecificationType.Attribute,
              attribute: 'apiTraceErrorSpanCount',
            },
            'click-handler': {
              type: 'api-trace-navigation-handler',
            },
          },
          {
            type: 'table-widget-column',
            title: 'Duration',
            width: '100px',
            display: TracingTableCellType.Metric,
            filterable: true,
            value: {
              type: ValueSpecificationType.Attribute,
              attribute: 'duration',
            },
            'click-handler': {
              type: 'api-trace-navigation-handler',
            },
          },
          {
            type: 'table-widget-column',
            title: 'Start Time',
            width: '220px',
            display: CoreTableCellRendererType.Timestamp,
            value: {
              type: ValueSpecificationType.Attribute,
              attribute: 'startTime',
            },
            sort: TableSortDirection.Descending,
            'click-handler': {
              type: 'api-trace-navigation-handler',
            },
          },
          {
            type: 'table-widget-column',
            title: 'End Time',
            width: '220px',
            display: CoreTableCellRendererType.Timestamp,
            visible: false,
            value: {
              type: ValueSpecificationType.Attribute,
              attribute: 'endTime',
            },
            'click-handler': {
              type: 'api-trace-navigation-handler',
            },
          },
          {
            type: 'table-widget-column',
            title: 'API Boundary Type',
            width: 1,
            visible: false,
            filterable: true,
            value: {
              type: ValueSpecificationType.Attribute,
              attribute: 'apiBoundaryType',
            },
            'click-handler': {
              type: 'api-trace-navigation-handler',
            },
          },
          {
            type: 'table-widget-column',
            title: 'API Discovery State',
            width: 1,
            visible: false,
            filterable: true,
            value: {
              type: ValueSpecificationType.Attribute,
              attribute: 'apiDiscoveryState',
            },
            'click-handler': {
              type: 'api-trace-navigation-handler',
            },
          },
          {
            type: 'table-widget-column',
            title: 'API ID',
            width: 1,
            visible: false,
            filterable: true,
            value: {
              type: ValueSpecificationType.Attribute,
              attribute: 'apiId',
            },
            'click-handler': {
              type: 'api-trace-navigation-handler',
            },
          },
          {
            type: 'table-widget-column',
            title: 'Entry Span ID',
            width: 1,
            visible: false,
            filterable: true,
            value: {
              type: ValueSpecificationType.Attribute,
              attribute: 'apiTraceId',
            },
            'click-handler': {
              type: 'api-trace-navigation-handler',
            },
          },
          {
            type: 'table-widget-column',
            title: 'Service ID',
            width: 1,
            visible: false,
            filterable: true,
            value: {
              type: ValueSpecificationType.Attribute,
              attribute: 'serviceId',
            },
            'click-handler': {
              type: 'api-trace-navigation-handler',
            },
          },
          {
            type: 'table-widget-column',
            title: 'Trace ID',
            width: 1,
            visible: false,
            filterable: true,
            value: {
              type: ValueSpecificationType.Attribute,
              attribute: 'traceId',
            },
            'click-handler': {
              type: 'api-trace-navigation-handler',
            },
          },
          {
            type: 'table-widget-column',
            title: 'Request URL',
            width: 1,
            visible: false,
            filterable: true,
            value: {
              type: ValueSpecificationType.Attribute,
              attribute: 'requestUrl',
            },
            'click-handler': {
              type: 'api-trace-navigation-handler',
            },
          },
        ];
      case SPAN_SCOPE:
        return [
          {
            type: 'table-widget-column',
            title: 'Protocol',
            width: '100px',
            filterable: true,
            value: {
              type: ValueSpecificationType.Attribute,
              attribute: 'protocolName',
            },
            'click-handler': {
              type: 'span-trace-navigation-handler',
            },
          },
          {
            type: 'table-widget-column',
            title: 'Service',
            width: 2,
            filterable: true,
            value: {
              type: ValueSpecificationType.Attribute,
              attribute: 'serviceName',
            },
            'click-handler': {
              type: 'span-trace-navigation-handler',
            },
          },
          {
            type: 'table-widget-column',
            title: 'Name',
            width: 2,
            filterable: true,
            value: {
              type: ValueSpecificationType.Attribute,
              attribute: 'displaySpanName',
            },
            'click-handler': {
              type: 'span-trace-navigation-handler',
            },
          },
          {
            type: 'table-widget-column',
            title: 'Status',
            width: '90px', // Use Status Cell Renderer
            filterable: true,
            value: {
              type: ValueSpecificationType.Attribute,
              attribute: 'statusCode',
            },
            'click-handler': {
              type: 'span-trace-navigation-handler',
            },
          },
          {
            type: 'table-widget-column',
            title: 'Errors',
            width: '100px',
            filterable: true,
            value: {
              type: ValueSpecificationType.Attribute,
              attribute: 'errorCount',
            },
            'click-handler': {
              type: 'api-trace-navigation-handler',
            },
          },
          {
            type: 'table-widget-column',
            title: 'Duration',
            width: '100px',
            display: TracingTableCellType.Metric,
            filterable: true,
            value: {
              type: ValueSpecificationType.Attribute,
              attribute: 'duration',
            },
            'click-handler': {
              type: 'span-trace-navigation-handler',
            },
          },
          {
            type: 'table-widget-column',
            title: 'Start Time',
            width: '220px',
            display: CoreTableCellRendererType.Timestamp,
            value: {
              type: ValueSpecificationType.Attribute,
              attribute: 'startTime',
            },
            sort: TableSortDirection.Descending,
            'click-handler': {
              type: 'span-trace-navigation-handler',
            },
          },
          {
            type: 'table-widget-column',
            title: 'End Time',
            width: '220px',
            display: CoreTableCellRendererType.Timestamp,
            visible: false,
            value: {
              type: ValueSpecificationType.Attribute,
              attribute: 'endTime',
            },
            'click-handler': {
              type: 'span-trace-navigation-handler',
            },
          },
          {
            type: 'table-widget-column',
            visible: false,
            filterable: true,
            value: {
              type: ValueSpecificationType.Attribute,
              attribute: 'traceId',
            },
            'click-handler': {
              type: 'span-trace-navigation-handler',
            },
          },
        ];

      default:
        return [];
    }
  }

  protected getAttributesToExcludeFromUserDisplay(context: string): Set<string> {
    switch (context) {
      case ObservabilityTraceType.Api:
        return new Set([
          'protocol',
          'serviceName',
          'apiName',
          'statusCode',
          'apiTraceErrorSpanCount',
          'duration',
          'startTime',
          'calls',
        ]);
      case SPAN_SCOPE:
        return new Set([
          'protocolName',
          'serviceName',
          'displaySpanName',
          'statusCode',
          'errorCount',
          'duration',
          'startTime',
        ]);
      default:
        return new Set();
    }
  }

  private removeDuplicatedColumns(columns: SpecificationBackedColumnModelJson[]): ModelJson[] {
    return uniqBy(columns, column =>
      column.value?.type === ValueSpecificationType.Attribute ? column.value.attribute : column,
    );
  }

  private getGeneratedTableColumns(
    attributes: AttributeMetadata[],
    context: string,
    selectedProperties: Specification[],
  ): SpecificationBackedColumnModelJson[] {
    const attributesToExclude = this.getAttributesToExcludeFromUserDisplay(context);

    return attributes
      .filter(attribute => !attributesToExclude.has(attribute.name))
      .map(attribute => ({
        type: 'table-widget-column',
        title: attribute.displayName,
        width: 1,
        display: this.getRendererForType(attribute.type),
        filterable: this.filterBuilderLookupService.isBuildableType(toFilterAttributeType(attribute.type)),
        value: {
          type: ValueSpecificationType.Attribute,
          attribute: attribute.name,
        },
        visible: selectedProperties.find(selectedProperty => selectedProperty.name === attribute.name) ? true : false,
        'click-handler': this.buildClickHandlerForContext(context),
      }));
  }

  protected buildClickHandlerForContext(context: string): ModelJson | undefined {
    return {
      type: context === SPAN_SCOPE ? 'span-trace-navigation-handler' : 'api-trace-navigation-handler',
    };
  }
}

export interface ExplorerGeneratedDashboard {
  json: ModelJson;
  onReady(dashboard: Dashboard): void;
}

export interface SpecificationBackedColumnModelJson extends ModelJson {
  value: ModelJson;
}

export const enum ValueSpecificationType {
  Attribute = 'attribute-specification',
  Composite = 'composite-specification',
  Status = 'trace-status-specification',
}

interface ResultsDashboardData {
  filters: GraphQlFilter[];
  json: ModelJson;
}
export interface ExplorerDashboardBuilderFactory {
  build(): ExplorerDashboardBuilder;
}

export const EXPLORER_DASHBOARD_BUILDER_FACTORY = new InjectionToken<ExplorerDashboardBuilderFactory>(
  'EXPLORER_DASHBOARD_BUILDER_FACTORY',
);
