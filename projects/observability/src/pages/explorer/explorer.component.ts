import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Filter, SPAN_SCOPE } from '@hypertrace/distributed-tracing';
import { Observable } from 'rxjs';
import { ExploreVisualizationRequest } from '../../shared/components/explore-query-editor/explore-visualization-builder';
import { ObservabilityTraceType } from '../../shared/graphql/model/schema/observability-traces';
import {
  ExplorerDashboardBuilder,
  ExplorerGeneratedDashboard,
  ExplorerGeneratedDashboardContext
} from './explorer-dashboard-builder';

@Component({
  styleUrls: ['./explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ExplorerDashboardBuilder],
  template: `
    <div class="vertical-flex-layout">
      <htc-page-header></htc-page-header>
      <div class="fill-container explorer-container">
        <htc-toggle-button-group (selectedLabelChange)="this.onContextChange($event)" class="toggle-filter">
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
  public static readonly API_TRACES: string = 'Endpoint Traces';
  public static readonly SPANS: string = 'Spans';

  public readonly resultsDashboard$: Observable<ExplorerGeneratedDashboard> = this.explorerDashboardBuilder
    .resultsDashboard$;
  public readonly vizDashboard$: Observable<ExplorerGeneratedDashboard> = this.explorerDashboardBuilder
    .visualizationDashboard$;

  public context: ExplorerGeneratedDashboardContext = ObservabilityTraceType.Api;
  public filters: Filter[] = [];

  public visualizationExpanded: boolean = true;
  public resultsExpanded: boolean = true;

  public constructor(private readonly explorerDashboardBuilder: ExplorerDashboardBuilder) {}

  public updateExplorer(request: ExploreVisualizationRequest): void {
    this.explorerDashboardBuilder.updateForRequest(request);
  }

  public onFiltersUpdated(newFilters: Filter[]): void {
    this.filters = [...newFilters];
  }

  public onContextChange(label: string): void {
    this.context = label === ExplorerComponent.API_TRACES ? ObservabilityTraceType.Api : SPAN_SCOPE;
  }
}
