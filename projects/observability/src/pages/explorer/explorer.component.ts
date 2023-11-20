import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NavigationService, PreferenceService, QueryParamObject, TimeDuration, ValueOrNull } from '@hypertrace/common';
import { Filter, FilterAttribute, ToggleItem } from '@hypertrace/components';
import { isEmpty } from 'lodash-es';
import { combineLatest, concat, EMPTY, Observable, of, Subject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import {
  ExploreOrderBy,
  ExploreRequestState,
  ExploreSeries,
  ExploreVisualizationBuilder,
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
  EXPLORER_DASHBOARD_BUILDER_FACTORY
} from './explorer-dashboard-builder';
import { ExplorerUrlParserService } from './explorer-url-parser.service';

@Component({
  selector: 'ht-explorer',
  styleUrls: ['./explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ExploreVisualizationBuilder],
  template: `
    <div class="explorer" *htLetAsync="this.currentState$ as currentState">
      <ht-page-header class="explorer-header"></ht-page-header>
      <ht-toggle-group
        class="explorer-data-toggle"
        [items]="currentState.availableContexts"
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
                (visualizationRequestChange)="
                  this.onVisualizationRequestUpdated($event, attributes, currentState.availableContexts)
                "
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
export class ExplorerComponent implements OnInit {
  private static readonly VISUALIZATION_EXPANDED_PREFERENCE: string = 'explorer.visualizationExpanded';
  private static readonly RESULTS_EXPANDED_PREFERENCE: string = 'explorer.resultsExpanded';
  private readonly explorerDashboardBuilder: ExplorerDashboardBuilder;
  public readonly resultsDashboard$: Observable<ExplorerGeneratedDashboard>;
  public readonly vizDashboard$: Observable<ExplorerGeneratedDashboard>;
  public currentState$!: Observable<InitialExplorerState>;
  public currentContext$!: Observable<string>;
  public attributes$: Observable<FilterAttribute[]> = EMPTY;
  public filters: Filter[] = [];
  public visualizationExpanded$: Observable<boolean>;
  public resultsExpanded$: Observable<boolean>;

  private readonly contextChangeSubject: Subject<string> = new Subject();

  public constructor(
    private readonly metadataService: MetadataService,
    protected readonly navigationService: NavigationService,
    private readonly preferenceService: PreferenceService,
    @Inject(EXPLORER_DASHBOARD_BUILDER_FACTORY) explorerDashboardBuilderFactory: ExplorerDashboardBuilderFactory,
    private readonly activatedRoute: ActivatedRoute,
    private readonly explorerUrlParserService: ExplorerUrlParserService
  ) {
    this.explorerDashboardBuilder = explorerDashboardBuilderFactory.build();
    this.visualizationExpanded$ = this.preferenceService.get(ExplorerComponent.VISUALIZATION_EXPANDED_PREFERENCE, true);
    this.resultsExpanded$ = this.preferenceService.get(ExplorerComponent.RESULTS_EXPANDED_PREFERENCE, true);
    this.resultsDashboard$ = this.explorerDashboardBuilder.resultsDashboard$;
    this.vizDashboard$ = this.explorerDashboardBuilder.visualizationDashboard$;
  }

  public ngOnInit(): void {
    this.buildState();
  }

  protected buildState(): void {
    const contextItems$ = this.buildContextItems();
    this.currentState$ = combineLatest([this.activatedRoute.queryParamMap, contextItems$]).pipe(
      take(1),
      map(([paramMap, availableContexts]) => this.mapToInitialState(paramMap, availableContexts))
    );

    this.currentContext$ = concat(
      this.currentState$.pipe(map(value => value.contextToggle.value.dashboardContext)),
      this.contextChangeSubject
    );
  }

  public onVisualizationRequestUpdated(
    newRequest: ExploreVisualizationRequest,
    attributes: FilterAttribute[],
    availableContexts: ExplorerContextToggleItem[]
  ): void {
    const updatedRequest = { ...newRequest, attributes: attributes };
    this.explorerDashboardBuilder.updateForRequest(updatedRequest);
    this.updateUrlWithVisualizationData(updatedRequest, availableContexts);
  }

  public onFiltersUpdated(newFilters: Filter[]): void {
    this.filters = [...newFilters];
  }

  private getOrDefaultContextItemFromQueryParam(
    contextItems: ExplorerContextToggleItem[],
    value: ValueOrNull<string>
  ): ExplorerContextToggleItem {
    return contextItems.find(item => value === item.value.scopeQueryParam) || contextItems[0];
  }

  protected getQueryParamFromContext(context: string, contextItems: ExplorerContextToggleItem[]): string {
    return (contextItems?.find(contextItem => contextItem.value.dashboardContext === context) ?? contextItems[0]).value
      .scopeQueryParam;
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

  protected buildContextItems(): Observable<ExplorerContextToggleItem[]> {
    return of([
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
    ]);
  }

  private updateUrlWithVisualizationData(
    request: ExploreRequestState,
    availableContexts: ExplorerContextToggleItem[]
  ): void {
    this.navigationService.addQueryParametersToUrl({
      [ExplorerQueryParam.Scope]: this.getQueryParamFromContext(request.context, availableContexts),
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

  private mapToInitialState(param: ParamMap, availableContexts: ExplorerContextToggleItem[]): InitialExplorerState {
    const explorerState = this.explorerUrlParserService.getExplorerState({
      series: param.getAll(ExplorerQueryParam.Series),
      interval: param.get(ExplorerQueryParam.Interval) ?? undefined,
      groupBy: param.getAll(ExplorerQueryParam.Group),
      includeOtherGroups: param.get(ExplorerQueryParam.OtherGroup) ?? undefined,
      groupLimit: param.get(ExplorerQueryParam.GroupLimit) ?? '5',
      orderBy: param.getAll(ExplorerQueryParam.Order) ?? undefined
    });

    return {
      availableContexts: availableContexts,
      contextToggle: this.getOrDefaultContextItemFromQueryParam(availableContexts, param.get(ExplorerQueryParam.Scope)),
      groupBy: explorerState.groupBy,
      interval: explorerState.interval,
      series: explorerState.series,
      orderBy: explorerState.orderBy
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
export interface ExplorerContextToggleItem extends ToggleItem<ExplorerContextScope> {
  value: ExplorerContextScope;
}

export interface InitialExplorerState {
  contextToggle: ExplorerContextToggleItem;
  availableContexts: ExplorerContextToggleItem[];
  series: ExploreSeries[];
  interval?: IntervalValue;
  groupBy?: GraphQlGroupBy;
  orderBy?: ExploreOrderBy;
}

interface ExplorerContextScope {
  dashboardContext: string;
  scopeQueryParam: string;
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
