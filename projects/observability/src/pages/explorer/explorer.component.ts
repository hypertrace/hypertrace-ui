import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavigationService } from '@hypertrace/common';
import { Filter, ToggleItem } from '@hypertrace/components';
import { AttributeMetadata, MetadataService, SPAN_SCOPE } from '@hypertrace/observability';
import { Observable, of } from 'rxjs';
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
    <div class="explorer">
      <ht-page-header class="explorer-header"></ht-page-header>
      <div class="explorer-content">
        <ht-toggle-group
          class="explorer-data-toggle"
          [items]="this.contextItems"
          [activeItem]="this.activeContextItem$ | async"
          (activeItemChange)="this.onContextUpdated($event.value)"
        ></ht-toggle-group>

        <ht-filter-bar
          class="explorer-filter-bar"
          [attributes]="this.attributes$ | async"
          [syncWithUrl]="true"
          (filtersChange)="this.onFiltersUpdated($event)"
        ></ht-filter-bar>

        <ht-panel class="visualization-panel" [(expanded)]="this.visualizationExpanded">
          <ht-panel-header>
            <ht-panel-title [expanded]="this.visualizationExpanded"
              ><span class="panel-title">Visualization</span></ht-panel-title
            >
          </ht-panel-header>

          <ht-panel-body>
            <div class="visualization-panel-content">
              <ht-explore-query-editor
                [context]="this.context"
                (visualizationRequestChange)="this.updateExplorer($event)"
                [filters]="this.filters"
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

        <ht-panel class="results-panel" [(expanded)]="this.resultsExpanded">
          <ht-panel-header>
            <ht-panel-title [expanded]="this.resultsExpanded"><span class="panel-title">Results</span> </ht-panel-title>
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
  public static readonly API_TRACES: 'Endpoint Traces' = 'Endpoint Traces';
  public static readonly SPANS: 'Spans' = 'Spans';
  private static readonly SCOPE_QUERY_PARAM: string = 'scope';

  private readonly explorerDashboardBuilder: ExplorerDashboardBuilder;
  public readonly resultsDashboard$: Observable<ExplorerGeneratedDashboard>;
  public readonly vizDashboard$: Observable<ExplorerGeneratedDashboard>;

  public contextItems: ContextToggleItem[] = [
    {
      label: ExplorerComponent.API_TRACES,
      value: {
        dashboardContext: ObservabilityTraceType.Api,
        scopeQueryParam: ScopeQueryParam.EndpointTraces
      }
    },
    {
      label: ExplorerComponent.SPANS,
      value: {
        dashboardContext: SPAN_SCOPE,
        scopeQueryParam: ScopeQueryParam.Spans
      }
    }
  ];
  public activeContextItem$: Observable<ContextToggleItem | undefined>;

  public attributes$: Observable<AttributeMetadata[]> = of([]);
  public context?: ExplorerGeneratedDashboardContext;
  public filters: Filter[] = [];

  public visualizationExpanded: boolean = true;
  public resultsExpanded: boolean = true;

  public constructor(
    private readonly metadataService: MetadataService,
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

  private getContextItemFromValue(value: ScopeQueryParam): ContextToggleItem | undefined {
    return this.contextItems.find(item => value === item.value.scopeQueryParam);
  }

  public onContextUpdated(value: ExplorerContextScope = this.contextItems[0].value): void {
    if (this.context !== value.dashboardContext) {
      this.context = value.dashboardContext;
      this.attributes$ = this.metadataService.getFilterAttributes(this.context);
    }

    // Set query param async to allow any initiating route change to complete
    setTimeout(() =>
      this.navigationService.addQueryParametersToUrl({
        [ExplorerComponent.SCOPE_QUERY_PARAM]: value.scopeQueryParam
      })
    );
  }
}

interface ContextToggleItem extends ToggleItem {
  value: ExplorerContextScope;
}

interface ExplorerContextScope {
  dashboardContext: ExplorerGeneratedDashboardContext;
  scopeQueryParam: ScopeQueryParam;
}

export const enum ScopeQueryParam {
  EndpointTraces = 'endpoint-traces',
  Spans = 'spans'
}
