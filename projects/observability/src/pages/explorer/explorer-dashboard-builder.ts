import { InjectionToken } from '@angular/core';
import { assertUnreachable, forkJoinSafeEmpty, isEqualIgnoreFunctions } from '@hypertrace/common';
import {
  CoreTableCellRendererType,
  FilterBuilderLookupService,
  TableMode,
  TableSortDirection,
  TableStyle
} from '@hypertrace/components';
import {
  AttributeMetadata,
  AttributeMetadataType,
  GraphQlFilter,
  GraphQlFilterDataSourceModel,
  MetadataService,
  SPAN_SCOPE,
  toFilterAttributeType,
  TracingTableCellType
} from '@hypertrace/distributed-tracing';
import { Dashboard, ModelJson } from '@hypertrace/hyperdash';
import { Observable, of, ReplaySubject, Subject } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { ExploreVisualizationRequest } from '../../shared/components/explore-query-editor/explore-visualization-builder';
import { LegendPosition } from '../../shared/components/legend/legend.component';
import { ExploreCartesianDataSourceModel } from '../../shared/dashboard/data/graphql/explore/explore-cartesian-data-source.model';
import { ObservabilityTraceType } from '../../shared/graphql/model/schema/observability-traces';

export class ExplorerDashboardBuilder {
  private readonly requestSubject: Subject<ExploreVisualizationRequest> = new ReplaySubject(1);

  public readonly visualizationDashboard$: Observable<ExplorerGeneratedDashboard>;
  public readonly resultsDashboard$: Observable<ExplorerGeneratedDashboard>;

  public constructor(
    private readonly metadataService: MetadataService,
    private readonly filterBuilderLookupService: FilterBuilderLookupService
  ) {
    // We only want to rebuild a dashboard if we actually have a meaningful request change
    const uniqueRequests$ = this.requestSubject.pipe(distinctUntilChanged(isEqualIgnoreFunctions));

    this.visualizationDashboard$ = uniqueRequests$.pipe(
      switchMap(request => this.buildVisualizationDashboard(request))
    );

    // Two step process so we can see if the trace request will ultimately be any different
    this.resultsDashboard$ = uniqueRequests$.pipe(
      switchMap(request => this.buildDashboardData(request)),
      distinctUntilChanged(isEqualIgnoreFunctions),
      map(data => this.buildResultsDashboard(data))
    );
  }

  public updateForRequest(request: ExploreVisualizationRequest): void {
    this.requestSubject.next(request);
  }

  private buildVisualizationDashboard(request: ExploreVisualizationRequest): Observable<ExplorerGeneratedDashboard> {
    return of({
      json: {
        type: 'cartesian-widget',
        'selectable-interval': false,
        'series-from-data': true,
        'legend-position': LegendPosition.Bottom
      },
      onReady: dashboard => {
        dashboard.createAndSetRootDataFromModelClass(ExploreCartesianDataSourceModel);
        const dataSource = dashboard.getRootDataSource<ExploreCartesianDataSourceModel>()!;
        dataSource.request = request;
      }
    });
  }

  public buildResultsDashboard(dashboardData: ResultsDashboardData): ExplorerGeneratedDashboard {
    return {
      json: dashboardData.json,

      onReady: dashboard => {
        const rootDataSource = dashboard.getRootDataSource<GraphQlFilterDataSourceModel>();
        rootDataSource && rootDataSource.clearFilters().addFilters(...dashboardData.filters);
      }
    };
  }

  private buildDashboardData(request: ExploreVisualizationRequest): Observable<ResultsDashboardData> {
    return request.resultsQuery$.pipe(
      switchMap(resultsQuery =>
        forkJoinSafeEmpty(
          resultsQuery.properties.map(property => this.metadataService.getAttribute(request.context, property.name))
        ).pipe(
          map(attributes => [
            ...this.getDefaultTableColumns(request.context as ExplorerGeneratedDashboardContext),
            ...this.getUserRequestedNonDefaultColumns(attributes, request.context as ExplorerGeneratedDashboardContext)
          ]),
          map(columns => this.buildColumnModelJson(request.context, columns)),
          map(json => ({
            json: json,
            filters: resultsQuery.filters || []
          }))
        )
      )
    );
  }

  protected buildColumnModelJson(context: string, columns: ModelJson[]): ModelJson {
    if (context === SPAN_SCOPE) {
      return {
        type: 'table-widget',
        mode: TableMode.Detail,
        style: TableStyle.FullPage,
        columns: columns,
        'child-template': {
          type: 'span-detail-widget',
          data: {
            type: 'span-detail-data-source',
            // tslint:disable-next-line: no-invalid-template-strings
            span: '${row}'
          }
        },
        data: {
          type: 'spans-table-data-source',
          trace: context
        }
      };
    }

    return {
      type: 'table-widget',
      mode: TableMode.Detail,
      style: TableStyle.Embedded,
      columns: columns,
      'child-template': {
        type: 'trace-detail-widget',
        data: {
          type: 'trace-detail-data-source',
          // tslint:disable-next-line: no-invalid-template-strings
          trace: '${row}',
          attributes: ['requestUrl']
        }
      },
      data: {
        type: 'traces-table-data-source',
        trace: context
      }
    };
  }

  private getRendererForType(type: AttributeMetadataType): string {
    switch (type) {
      case AttributeMetadataType.Number:
        return CoreTableCellRendererType.Number;
      case AttributeMetadataType.Timestamp:
        return CoreTableCellRendererType.Timestamp;
      default:
        return CoreTableCellRendererType.Text;
    }
  }

  private getDefaultTableColumns(context: ExplorerGeneratedDashboardContext): ModelJson[] {
    switch (context) {
      case ObservabilityTraceType.Api:
        return [
          {
            type: 'table-widget-column',
            title: 'Type',
            width: '96px',
            display: CoreTableCellRendererType.Text,
            filterable: true,
            value: {
              type: 'attribute-specification',
              attribute: 'protocol'
            },
            'click-handler': {
              type: 'api-trace-navigation-handler'
            }
          },
          {
            type: 'table-widget-column',
            title: 'Service',
            width: '2',
            filterable: true,
            value: {
              type: 'attribute-specification',
              attribute: 'serviceName'
            },
            'click-handler': {
              type: 'api-trace-navigation-handler'
            }
          },
          {
            type: 'table-widget-column',
            title: 'Endpoint',
            width: '2',
            filterable: true,
            value: {
              type: 'attribute-specification',
              attribute: 'apiName'
            },
            'click-handler': {
              type: 'api-trace-navigation-handler'
            }
          },
          {
            type: 'table-widget-column',
            title: 'Status',
            width: '184px',
            display: TracingTableCellType.TraceStatus,
            filterable: true,
            value: {
              type: 'trace-status-specification'
            },
            'click-handler': {
              type: 'api-trace-navigation-handler'
            }
          },
          {
            type: 'table-widget-column',
            title: 'Duration',
            width: '100px',
            display: TracingTableCellType.Metric,
            filterable: true,
            value: {
              type: 'attribute-specification',
              attribute: 'duration'
            },
            'click-handler': {
              type: 'api-trace-navigation-handler'
            }
          },
          {
            type: 'table-widget-column',
            title: 'Start Time',
            width: '220px',
            display: CoreTableCellRendererType.Timestamp,
            value: {
              type: 'attribute-specification',
              attribute: 'startTime'
            },
            sort: TableSortDirection.Descending,
            'click-handler': {
              type: 'api-trace-navigation-handler'
            }
          }
        ];
      case SPAN_SCOPE:
        return [
          {
            type: 'table-widget-column',
            title: 'Protocol',
            width: '10%',
            filterable: true,
            value: {
              type: 'attribute-specification',
              attribute: 'protocolName'
            },
            'click-handler': {
              type: 'span-trace-navigation-handler'
            }
          },
          {
            type: 'table-widget-column',
            title: 'Service',
            width: '20%',
            filterable: true,
            value: {
              type: 'attribute-specification',
              attribute: 'serviceName'
            },
            'click-handler': {
              type: 'api-trace-navigation-handler'
            }
          },
          {
            type: 'table-widget-column',
            title: 'Name',
            filterable: true,
            value: {
              type: 'attribute-specification',
              attribute: 'displaySpanName'
            },
            'click-handler': {
              type: 'span-trace-navigation-handler'
            }
          },
          {
            type: 'table-widget-column',
            title: 'Status',
            width: '5%', // Use Status Cell Renderer
            filterable: true,
            value: {
              type: 'attribute-specification',
              attribute: 'statusCode'
            },
            'click-handler': {
              type: 'span-trace-navigation-handler'
            }
          },
          {
            type: 'table-widget-column',
            title: 'Duration',
            width: '100px',
            display: TracingTableCellType.Metric,
            filterable: true,
            value: {
              type: 'attribute-specification',
              attribute: 'duration'
            },
            'click-handler': {
              type: 'api-trace-navigation-handler'
            }
          },
          {
            type: 'table-widget-column',
            title: 'Start Time',
            width: '220px',
            display: CoreTableCellRendererType.Timestamp,
            value: {
              type: 'attribute-specification',
              attribute: 'startTime'
            },
            sort: TableSortDirection.Descending,
            'click-handler': {
              type: 'span-trace-navigation-handler'
            }
          },
          {
            type: 'table-widget-column',
            visible: false,
            value: {
              type: 'attribute-specification',
              attribute: 'traceId'
            }
          }
        ];

      default:
        return assertUnreachable(context);
    }
  }

  private getAttributesToExcludeFromUserDisplay(context: ExplorerGeneratedDashboardContext): Set<string> {
    switch (context) {
      case ObservabilityTraceType.Api:
        return new Set(['protocol', 'apiName', 'statusCode', 'duration', 'startTime']);
      case SPAN_SCOPE:
        return new Set(['protocolName', 'displaySpanName', 'statusCode', 'duration', 'startTime']);
      default:
        return assertUnreachable(context);
    }
  }

  private getUserRequestedNonDefaultColumns(
    attributes: AttributeMetadata[],
    context: ExplorerGeneratedDashboardContext
  ): ModelJson[] {
    const attributesToExclude = this.getAttributesToExcludeFromUserDisplay(context);

    return attributes
      .filter(attribute => !attributesToExclude.has(attribute.name))
      .map(attribute => ({
        type: 'table-widget-column',
        title: attribute.displayName,
        width: '1',
        display: this.getRendererForType(attribute.type),
        filterable: this.filterBuilderLookupService.isBuildableType(toFilterAttributeType(attribute.type)),
        value: {
          type: 'attribute-specification',
          attribute: attribute.name
        },
        'click-handler': {
          type: context === SPAN_SCOPE ? 'span-trace-navigation-handler' : 'api-trace-navigation-handler'
        }
      }));
  }
}

export interface ExplorerGeneratedDashboard {
  json: ModelJson;
  onReady(dashboard: Dashboard): void;
}

export type ExplorerGeneratedDashboardContext = ObservabilityTraceType.Api | 'SPAN';

interface ResultsDashboardData {
  filters: GraphQlFilter[];
  json: ModelJson;
}
export interface ExplorerDashboardBuilderFactory {
  build(): ExplorerDashboardBuilder;
}

export const EXPLORER_DASHBOARD_BUILDER_FACTORY = new InjectionToken<ExplorerDashboardBuilderFactory>(
  'EXPLORER_DASHBOARD_BUILDER_FACTORY'
);
