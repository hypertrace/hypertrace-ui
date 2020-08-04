import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavigationService } from '@hypertrace/common';
import { ToggleItem } from '@hypertrace/components';
import { Filter, SPAN_SCOPE } from '@hypertrace/distributed-tracing';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ExploreVisualizationRequest } from '../../shared/components/explore-query-editor/explore-visualization-builder';
import { ObservabilityTraceType } from '../../shared/graphql/model/schema/observability-traces';
import {
  ExplorerDashboardBuilder,
  ExplorerDashboardBuilderFactory,
  ExplorerGeneratedDashboard,
  ExplorerGeneratedDashboardContext,
  EXPLORER_DASHBOARD_BUILDER_FACTORY
} from './explorer-dashboard-builder';

@Component({
  styleUrls: ['./explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="vertical-flex-layout">
      <htc-page-header></htc-page-header>
      <div class="fill-container explorer-container">
        <htc-toggle-group
          [items]="this.contextItems"
          [activeItem]="this.activeContextItem$ | async"
          (activeItemChange)="this.onContextUpdated($event.value)"
        ></htc-toggle-group>

        <htc-filter-bar
          class="filter-bar"
          [scope]="this.context"
          [syncWithUrl]="true"
          (filtersChange)="this.onFiltersUpdated($event)"
        ></htc-filter-bar>

        <htc-panel class="visualization-panel" [(expanded)]="this.visualizationExpanded">
          <htc-panel-header>
            <htc-panel-title [expanded]="this.visualizationExpanded"
              ><span class="panel-title">Visualization</span></htc-panel-title
            >
          </htc-panel-header>

          <htc-panel-body>
            <div class="visualization-panel-content">
              <ht-explore-query-editor
                [context]="this.context"
                (visualizationRequestChange)="this.updateExplorer($event)"
                [filters]="this.filters"
              ></ht-explore-query-editor>

              <htc-application-aware-dashboard
                *ngIf="this.vizDashboard$ | async as vizDashboard"
                class="visualization-dashboard"
                [padding]="0"
                [json]="vizDashboard.json"
                (dashboardReady)="vizDashboard.onReady($event)"
              >
              </htc-application-aware-dashboard>
            </div>
          </htc-panel-body>
        </htc-panel>

        <htc-panel class="results-panel" [(expanded)]="this.resultsExpanded">
          <htc-panel-header>
            <htc-panel-title [expanded]="this.resultsExpanded"
              ><span class="panel-title">Results</span>
            </htc-panel-title>
          </htc-panel-header>
          <htc-panel-body>
            <htc-application-aware-dashboard
              *ngIf="this.resultsDashboard$ | async as resultsDashboard"
              class="results-panel-content"
              [padding]="0"
              [json]="resultsDashboard.json"
              (dashboardReady)="resultsDashboard.onReady($event)"
            >
            </htc-application-aware-dashboard>
          </htc-panel-body>
        </htc-panel>
      </div>
    </div>
  `
})
export class ExplorerComponent {
  public static readonly API_TRACES: 'Endpoint Traces' = 'Endpoint Traces';
  public static readonly SPANS: 'Spans' = 'Spans';
  private static readonly SCOPE_QUERY_PARAM: string = 'scope';

  private readonly explorerDashboardBuilder: ExplorerDashboardBuilder;
  public readonly resultsDashboard$: Observable<ExplorerGeneratedDashboard>;
  public readonly vizDashboard$: Observable<ExplorerGeneratedDashboard>;

  public contextItems: ToggleItem<ExplorerContextScope>[] = [
    {
      label: ExplorerComponent.API_TRACES,
      value: {
        context: ObservabilityTraceType.Api,
        scope: ScopeQueryParam.EndpointTraces
      }
    },
    {
      label: ExplorerComponent.SPANS,
      value: {
        context: SPAN_SCOPE,
        scope: ScopeQueryParam.Spans
      }
    }
  ];
  public activeContextItem$: Observable<ToggleItem | undefined>;

  public context?: ExplorerGeneratedDashboardContext;
  public filters: Filter[] = [];

  public visualizationExpanded: boolean = true;
  public resultsExpanded: boolean = true;

  public constructor(
    private readonly navigationService: NavigationService,
    @Inject(EXPLORER_DASHBOARD_BUILDER_FACTORY) explorerDashboardBuilderFactory: ExplorerDashboardBuilderFactory,
    activatedRoute: ActivatedRoute
  ) {
    this.explorerDashboardBuilder = explorerDashboardBuilderFactory.build();
    this.resultsDashboard$ = this.explorerDashboardBuilder.resultsDashboard$;
    this.vizDashboard$ = this.explorerDashboardBuilder.visualizationDashboard$;
    this.activeContextItem$ = activatedRoute.queryParamMap.pipe(
      map(paramMap => paramMap.get(ExplorerComponent.SCOPE_QUERY_PARAM)),
      map(queryParam => this.getContextItemFromValue(queryParam as ScopeQueryParam)),
      tap(toggleItem => this.onContextUpdated(toggleItem?.value))
    );
  }

  public updateExplorer(request: ExploreVisualizationRequest): void {
    this.explorerDashboardBuilder.updateForRequest(request);
  }

  public onFiltersUpdated(newFilters: Filter[]): void {
    this.filters = [...newFilters];
  }

  private getContextItemFromValue(value: ScopeQueryParam): ToggleItem<ExplorerContextScope> | undefined {
    return this.contextItems.find(item => value === item.value.scope);
  }

  public onContextUpdated(value: ExplorerContextScope = this.contextItems[0].value): void {
    this.context = value.context;
    // Set query param async to allow any initiating route change to complete
    setTimeout(() =>
      this.navigationService.addQueryParametersToUrl({
        [ExplorerComponent.SCOPE_QUERY_PARAM]: value.scope
      })
    );
  }
}

interface ExplorerContextScope {
  context: ExplorerGeneratedDashboardContext;
  scope: ScopeQueryParam;
}

const enum ScopeQueryParam {
  EndpointTraces = 'endpoint-traces',
  Spans = 'spans'
}
