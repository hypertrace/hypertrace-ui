import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
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
import { map } from 'rxjs/operators';
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
import { MetadataService } from '../../shared/services/metadata/metadata.service';
import {
  ExplorerDashboardBuilder,
  ExplorerDashboardBuilderFactory,
  ExplorerGeneratedDashboard,
  ExplorerGeneratedDashboardContext,
  EXPLORER_DASHBOARD_BUILDER_FACTORY
} from './explorer-dashboard-builder';
import { ExplorerStateManagerComponentService } from './explorer-state-manager-component.service';

@Component({
  selector: 'ht-explorer',
  styleUrls: ['./explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="explorer" *htLetAsync="this.initialState$ as initialState">
      <ht-page-header class="explorer-header"></ht-page-header>
      <ht-toggle-group
        class="explorer-data-toggle"
        [items]="this.contextItems"
        [activeItem]="initialState.contextToggle"
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
                [series]="initialState.series"
                [interval]="initialState.interval"
                [groupBy]="initialState.groupBy"
                [orderBy]="initialState.orderBy"
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
  public readonly contextItems: ContextToggleItem[];
  private static readonly VISUALIZATION_EXPANDED_PREFERENCE: string = 'explorer.visualizationExpanded';
  private static readonly RESULTS_EXPANDED_PREFERENCE: string = 'explorer.resultsExpanded';
  private readonly explorerDashboardBuilder: ExplorerDashboardBuilder;
  public readonly resultsDashboard$: Observable<ExplorerGeneratedDashboard>;
  public readonly vizDashboard$: Observable<ExplorerGeneratedDashboard>;
  public readonly initialState$: Observable<InitialExplorerState>;
  public readonly currentContext$: Observable<ExplorerGeneratedDashboardContext>;
  public attributes$: Observable<FilterAttribute[]> = EMPTY;
  public filters: Filter[] = [];
  public visualizationExpanded$: Observable<boolean>;
  public resultsExpanded$: Observable<boolean>;

  private readonly contextChangeSubject: Subject<ExplorerGeneratedDashboardContext> = new Subject();

  public constructor(
    private readonly metadataService: MetadataService,
    protected readonly navigationService: NavigationService,
    private readonly preferenceService: PreferenceService,
    protected readonly explorerStateManagerComponentService: ExplorerStateManagerComponentService,
    @Inject(EXPLORER_DASHBOARD_BUILDER_FACTORY) explorerDashboardBuilderFactory: ExplorerDashboardBuilderFactory
  ) {
    this.contextItems = this.explorerStateManagerComponentService.contextItems;
    this.explorerDashboardBuilder = explorerDashboardBuilderFactory.build();
    this.visualizationExpanded$ = this.preferenceService.get(ExplorerComponent.VISUALIZATION_EXPANDED_PREFERENCE, true);
    this.resultsExpanded$ = this.preferenceService.get(ExplorerComponent.RESULTS_EXPANDED_PREFERENCE, true);
    this.resultsDashboard$ = this.explorerDashboardBuilder.resultsDashboard$;
    this.vizDashboard$ = this.explorerDashboardBuilder.visualizationDashboard$;
    this.initialState$ = this.explorerStateManagerComponentService.currentState$;
    this.currentContext$ = concat(
      this.initialState$.pipe(map(value => value.contextToggle.value.dashboardContext)),
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

export interface ContextToggleItem extends ToggleItem<ExplorerContextScope> {
  value: ExplorerContextScope;
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

export interface ExplorerContextScope {
  dashboardContext: ExplorerGeneratedDashboardContext;
  scopeQueryParam: ScopeQueryParam;
}

export interface InitialExplorerState {
  contextToggle: ContextToggleItem;
  series: ExploreSeries[];
  interval?: IntervalValue;
  groupBy?: GraphQlGroupBy;
  orderBy?: ExploreOrderBy;
}
