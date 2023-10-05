import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import {
  assertUnreachable,
  NavigationService,
  PreferenceService,
  QueryParamObject,
  TimeDuration
} from '@hypertrace/common';
import { Filter, FilterAttribute, ToggleItem } from '@hypertrace/components';
import { isEmpty } from 'lodash-es';
import { concat, EMPTY, Observable, Subject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import {
  ExploreOrderBy,
  ExploreRequestState,
  ExploreSeries,
  ExploreVisualizationRequest
} from '../../shared/components/explore-query-editor/explore-visualization-builder';
import { IntervalValue } from '../../shared/components/interval-select/interval-select.component';
import { AttributeExpression } from '../../shared/graphql/model/attribute/attribute-expression';
import { toFilterAttributeType } from '../../shared/graphql/model/metadata/attribute-metadata';
import { GraphQlGroupBy } from '../../shared/graphql/model/schema/groupby/graphql-group-by';
import { ObservabilityTraceType } from '../../shared/graphql/model/schema/observability-traces';
import { SPAN_SCOPE } from '../../shared/graphql/model/schema/span';
import { MetadataService } from '../../shared/services/metadata/metadata.service';
import {
  ExplorerDashboardBuilder,
  ExplorerDashboardBuilderFactory,
  ExplorerGeneratedDashboard,
  ExplorerGeneratedDashboardContext,
  EXPLORER_DASHBOARD_BUILDER_FACTORY
} from './explorer-dashboard-builder';
import { ExplorerUrlParserService } from './explorer-url-parser.service';

@Component({
  selector: 'ht-explorer',
  styleUrls: ['./explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="explorer" *htLetAsync="this.currentState$ as currentState">
      <ht-page-header class="explorer-header"></ht-page-header>
      <ht-toggle-group
        class="explorer-data-toggle"
        [items]="this.contextItems"
        [activeItem]="currentState.contextToggle"
        (activeItemChange)="this.onContextUpdated($event.value)"
      ></ht-toggle-group>

      <ht-filter-bar
        *ngIf="this.attributes$ | async as attributes"
        class="explorer-filter-bar"
        [attributes]="attributes"
        [syncWithUrl]="true"
        (filtersChange)="this.onFiltersUpdated($event)"
      ></ht-filter-bar>
      <div class="explorer-content">
        <ht-panel
          *htLetAsync="this.visualizationExpanded$ as visualizationExpanded"
          class="visualization-panel"
          [expanded]="visualizationExpanded"
          (expandedChange)="this.onVisualizationExpandedChange($event)"
        >
          <ht-panel-header>
            <ht-panel-title [expanded]="visualizationExpanded"
              ><span class="panel-title">Visualization</span></ht-panel-title
            >
          </ht-panel-header>

          <ht-panel-body>
            <div class="visualization-panel-content">
              <ht-explore-query-editor
                *ngIf="this.attributes$ | async as attributes"
                [context]="this.currentContext$ | async"
                [filters]="this.filters"
                [series]="currentState.series"
                [interval]="currentState.interval"
                [groupBy]="currentState.groupBy"
                [orderBy]="currentState.orderBy"
                (visualizationRequestChange)="this.onVisualizationRequestUpdated($event, attributes)"
              ></ht-explore-query-editor>

              <ht-application-aware-dashboard
                *ngIf="this.vizDashboard$ | async as vizDashboard"
                class="visualization-dashboard"
                [padding]="0"
                [json]="vizDashboard.json"
                (dashboardReady)="vizDashboard.onReady($event)"
              >
              </ht-application-aware-dashboard>
            </div>
          </ht-panel-body>
        </ht-panel>

        <ht-panel
          *htLetAsync="this.resultsExpanded$ as resultsExpanded"
          class="results-panel"
          [expanded]="resultsExpanded"
          (expandedChange)="this.onResultsExpandedChange($event)"
        >
          <ht-panel-header>
            <ht-panel-title [expanded]="resultsExpanded"><span class="panel-title">Results</span> </ht-panel-title>
          </ht-panel-header>
          <ht-panel-body>
            <ht-application-aware-dashboard
              *ngIf="this.resultsDashboard$ | async as resultsDashboard"
              class="results-panel-content"
              [padding]="0"
              [json]="resultsDashboard.json"
              (dashboardReady)="resultsDashboard.onReady($event)"
            >
            </ht-application-aware-dashboard>
          </ht-panel-body>
        </ht-panel>
      </div>
    </div>
  `
})
export class ExplorerComponent {
  private static readonly VISUALIZATION_EXPANDED_PREFERENCE: string = 'explorer.visualizationExpanded';
  private static readonly RESULTS_EXPANDED_PREFERENCE: string = 'explorer.resultsExpanded';
  private readonly explorerDashboardBuilder: ExplorerDashboardBuilder;
  public readonly resultsDashboard$: Observable<ExplorerGeneratedDashboard>;
  public readonly vizDashboard$: Observable<ExplorerGeneratedDashboard>;
  public currentState$!: Observable<InitialExplorerState>;
  public currentContext$!: Observable<ExplorerGeneratedDashboardContext>;
  public attributes$: Observable<FilterAttribute[]> = EMPTY;

  public readonly contextItems: ContextToggleItem[] = [
    {
      label: 'Endpoint Traces',
      value: {
        dashboardContext: ObservabilityTraceType.Api,
        scopeQueryParam: ScopeQueryParam.EndpointTraces
      }
    },
    {
      label: 'Spans',
      value: {
        dashboardContext: SPAN_SCOPE,
        scopeQueryParam: ScopeQueryParam.Spans
      }
    }
  ];

  public filters: Filter[] = [];
  public visualizationExpanded$: Observable<boolean>;
  public resultsExpanded$: Observable<boolean>;

  private readonly contextChangeSubject: Subject<ExplorerGeneratedDashboardContext> = new Subject();

  public constructor(
    private readonly metadataService: MetadataService,
    protected readonly navigationService: NavigationService,
    private readonly preferenceService: PreferenceService,
    @Inject(EXPLORER_DASHBOARD_BUILDER_FACTORY) explorerDashboardBuilderFactory: ExplorerDashboardBuilderFactory,
    private readonly activatedRoute: ActivatedRoute,
    protected readonly explorerUrlParserService: ExplorerUrlParserService
  ) {
    this.explorerDashboardBuilder = explorerDashboardBuilderFactory.build();
    this.visualizationExpanded$ = this.preferenceService.get(ExplorerComponent.VISUALIZATION_EXPANDED_PREFERENCE, true);
    this.resultsExpanded$ = this.preferenceService.get(ExplorerComponent.RESULTS_EXPANDED_PREFERENCE, true);
    this.resultsDashboard$ = this.explorerDashboardBuilder.resultsDashboard$;
    this.vizDashboard$ = this.explorerDashboardBuilder.visualizationDashboard$;
    this.buildState();
  }

  protected buildState(): void {
    this.currentState$ = this.activatedRoute.queryParamMap.pipe(
      take(1),
      map(paramMap => this.mapToInitialState(paramMap))
    );
    this.currentContext$ = concat(
      this.currentState$.pipe(map(value => value.contextToggle.value.dashboardContext)),
      this.contextChangeSubject
    );
  }

  public onVisualizationRequestUpdated(newRequest: ExploreVisualizationRequest, attributes: FilterAttribute[]): void {
    const updatedRequest = { ...newRequest, attributes: attributes };
    this.explorerDashboardBuilder.updateForRequest(updatedRequest);
    this.updateUrlWithVisualizationData(updatedRequest);
  }

  public onFiltersUpdated(newFilters: Filter[]): void {
    this.filters = [...newFilters];
  }

  private getOrDefaultContextItemFromQueryParam(value?: ScopeQueryParam): ContextToggleItem {
    return this.contextItems.find(item => value === item.value.scopeQueryParam) || this.contextItems[0];
  }

  private getQueryParamFromContext(context: ExplorerGeneratedDashboardContext): ScopeQueryParam {
    switch (context) {
      case ObservabilityTraceType.Api:
        return ScopeQueryParam.EndpointTraces;
      case 'SPAN':
        return ScopeQueryParam.Spans;
      default:
        return assertUnreachable(context);
    }
  }

  public onContextUpdated(contextWrapper: ExplorerContextScope): void {
    this.attributes$ = this.metadataService.getFilterAttributes(contextWrapper.dashboardContext).pipe(
      map(attributes =>
        attributes.map(attribute => ({
          name: attribute.name,
          displayName: attribute.displayName,
          units: attribute.units,
          type: toFilterAttributeType(attribute.type),
          onlySupportsAggregation: attribute.onlySupportsAggregation,
          onlySupportsGrouping: attribute.onlySupportsGrouping
        }))
      )
    );
    this.contextChangeSubject.next(contextWrapper.dashboardContext);
  }

  public onVisualizationExpandedChange(expanded: boolean): void {
    this.preferenceService.set(ExplorerComponent.VISUALIZATION_EXPANDED_PREFERENCE, expanded);
  }

  public onResultsExpandedChange(expanded: boolean): void {
    this.preferenceService.set(ExplorerComponent.RESULTS_EXPANDED_PREFERENCE, expanded);
  }

  private updateUrlWithVisualizationData(request: ExploreRequestState): void {
    this.navigationService.addQueryParametersToUrl({
      [ExplorerQueryParam.Scope]: this.getQueryParamFromContext(request.context as ExplorerGeneratedDashboardContext),
      [ExplorerQueryParam.Interval]: this.encodeInterval(request.interval),
      [ExplorerQueryParam.Series]: request.series.map(series => this.encodeExploreSeries(series)),
      ...this.getOrderByQueryParams(request.orderBy),
      ...this.getGroupByQueryParams(request.groupBy)
    });
  }

  private getOrderByQueryParams(orderBy?: ExploreOrderBy): QueryParamObject {
    return orderBy === undefined
      ? {
          [ExplorerQueryParam.Order]: undefined
        }
      : {
          [ExplorerQueryParam.Order]: this.encodeExploreOrderBy(orderBy)
        };
  }

  private getGroupByQueryParams(groupBy?: GraphQlGroupBy): QueryParamObject {
    const keyExpressions = groupBy?.keyExpressions ?? [];
    if (keyExpressions.length === 0) {
      return {
        // Clear existing selection
        [ExplorerQueryParam.Group]: undefined,
        [ExplorerQueryParam.OtherGroup]: undefined,
        [ExplorerQueryParam.GroupLimit]: undefined
      };
    }

    return {
      [ExplorerQueryParam.Group]: keyExpressions.map(expression => this.encodeAttributeExpression(expression)),
      [ExplorerQueryParam.OtherGroup]: groupBy?.includeRest || undefined, // No param needed for false
      [ExplorerQueryParam.GroupLimit]: groupBy?.limit
    };
  }

  private mapToInitialState(param: ParamMap): InitialExplorerState {
    const series: ExploreSeries[] = param
      .getAll(ExplorerQueryParam.Series)
      .flatMap((seriesString: string) => this.explorerUrlParserService.tryDecodeExploreSeries(seriesString));

    const interval: IntervalValue = this.explorerUrlParserService.decodeInterval(
      param.get(ExplorerQueryParam.Interval)
    );

    return {
      contextToggle: this.getOrDefaultContextItemFromQueryParam(param.get(ExplorerQueryParam.Scope) as ScopeQueryParam),
      groupBy: param.has(ExplorerQueryParam.Group)
        ? {
            keyExpressions: param
              .getAll(ExplorerQueryParam.Group)
              .flatMap(expressionString =>
                this.explorerUrlParserService.tryDecodeAttributeExpression(expressionString)
              ),
            includeRest: param.get(ExplorerQueryParam.OtherGroup) === 'true',

            limit: parseInt(param.get(ExplorerQueryParam.GroupLimit)!) || 5
          }
        : undefined,
      interval: interval,
      series: series,
      orderBy:
        interval === 'NONE'
          ? this.explorerUrlParserService.tryDecodeExploreOrderBy(
              series[0],
              param.get(ExplorerQueryParam.Order) ?? undefined
            )
          : undefined
    };
  }

  private encodeInterval(interval?: TimeDuration | 'AUTO'): string | undefined {
    if (!interval) {
      return 'NONE';
    }
    if (interval === 'AUTO') {
      return undefined;
    }

    return interval.toString();
  }

  private encodeExploreSeries(series: ExploreSeries): string {
    return `${series.visualizationOptions.type}:${series.specification.aggregation}(${series.specification.name})`;
  }

  private encodeExploreOrderBy(orderBy: ExploreOrderBy): string {
    return `${orderBy.aggregation}(${orderBy.attribute.key}):${orderBy.direction}`;
  }

  private encodeAttributeExpression(attributeExpression: AttributeExpression): string {
    if (isEmpty(attributeExpression.subpath)) {
      return attributeExpression.key;
    }

    return `${attributeExpression.key}__${attributeExpression.subpath}`;
  }
}
interface ContextToggleItem extends ToggleItem<ExplorerContextScope> {
  value: ExplorerContextScope;
}

export interface InitialExplorerState {
  contextToggle: ContextToggleItem;
  series: ExploreSeries[];
  interval?: IntervalValue;
  groupBy?: GraphQlGroupBy;
  orderBy?: ExploreOrderBy;
}

interface ExplorerContextScope {
  dashboardContext: ExplorerGeneratedDashboardContext;
  scopeQueryParam: ScopeQueryParam;
}

export const enum ScopeQueryParam {
  EndpointTraces = 'endpoint-traces',
  Spans = 'spans'
}

export const enum ExplorerQueryParam {
  Scope = 'scope',
  Interval = 'interval',
  Group = 'group',
  OtherGroup = 'other',
  GroupLimit = 'limit',
  Series = 'series',
  Order = 'order',
  Filters = 'filter'
}
