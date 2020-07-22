import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { assertUnreachable, NavigationService } from '@hypertrace/common';
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
        <htc-toggle-button-group
          [selectedLabel]="this.contextLabel$ | async"
          (selectedLabelChange)="this.onContextUpdated($event)"
          class="toggle-filter"
        >
          <htc-toggle-button label="${ExplorerComponent.API_TRACES}"> </htc-toggle-button>
          <htc-toggle-button label="${ExplorerComponent.SPANS}"> </htc-toggle-button>
        </htc-toggle-button-group>

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
  public readonly contextLabel$: Observable<ContextLabel>;

  public context?: ExplorerGeneratedDashboardContext;
  public filters: Filter[] = [];

  public visualizationExpanded: boolean = true;
  public resultsExpanded: boolean = true;

  public constructor(
    private readonly navigationService: NavigationService,
    @Inject(EXPLORER_DASHBOARD_BUILDER_FACTORY) explorerDasboardBuilderFactory: ExplorerDashboardBuilderFactory,
    activatedRoute: ActivatedRoute
  ) {
    this.explorerDashboardBuilder = explorerDasboardBuilderFactory.build();
    this.resultsDashboard$ = this.explorerDashboardBuilder.resultsDashboard$;
    this.vizDashboard$ = this.explorerDashboardBuilder.visualizationDashboard$;
    this.contextLabel$ = activatedRoute.queryParamMap.pipe(
      map(paramMap => paramMap.get(ExplorerComponent.SCOPE_QUERY_PARAM)),
      map(queryParam => this.queryParamToContextLabel(queryParam)),
      tap(label => this.onContextUpdated(label))
    );
  }

  public updateExplorer(request: ExploreVisualizationRequest): void {
    this.explorerDashboardBuilder.updateForRequest(request);
  }

  public onFiltersUpdated(newFilters: Filter[]): void {
    this.filters = [...newFilters];
  }

  public onContextUpdated(label: ContextLabel): void {
    this.context = this.contextLabelToDashboardContext(label);
    // Set query param async to allow any initating route change to complete
    setTimeout(() =>
      this.navigationService.addQueryParametersToUrl({
        [ExplorerComponent.SCOPE_QUERY_PARAM]: this.contextLabelToQueryParam(label)
      })
    );
  }

  private queryParamToContextLabel(queryParam: string | null): ContextLabel {
    switch (queryParam) {
      case ScopeQueryParam.Spans:
        return ExplorerComponent.SPANS;
      case ScopeQueryParam.EndpointTraces:
      default:
        return ExplorerComponent.API_TRACES;
    }
  }

  private contextLabelToDashboardContext(label: ContextLabel): ExplorerGeneratedDashboardContext {
    switch (label) {
      case ExplorerComponent.SPANS:
        return SPAN_SCOPE;
      case ExplorerComponent.API_TRACES:
        return ObservabilityTraceType.Api;
      default:
        return assertUnreachable(label);
    }
  }

  private contextLabelToQueryParam(label: ContextLabel): ScopeQueryParam {
    switch (label) {
      case ExplorerComponent.SPANS:
        return ScopeQueryParam.Spans;
      case ExplorerComponent.API_TRACES:
        return ScopeQueryParam.EndpointTraces;
      default:
        return assertUnreachable(label);
    }
  }
}

type ContextLabel = 'Spans' | 'Endpoint Traces';
const enum ScopeQueryParam {
  EndpointTraces = 'endpoint_traces',
  Spans = 'spans'
}
