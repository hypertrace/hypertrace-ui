import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { TimeDuration } from '@hypertrace/common';
import { ExplorerGeneratedDashboard } from '../../explorer/explorer-dashboard-builder';
import { PanelData } from '../custom-dashboard-store.service';
import {
  ExploreSeries,
  ExploreVisualizationBuilder,
  ExploreVisualizationRequest
} from './../../../shared/components/explore-query-editor/explore-visualization-builder';
import { ExplorerVisualizationCartesianDataSourceModel } from './../../../shared/dashboard/data/graphql/explorer-visualization/explorer-visualization-cartesian-data-source.model';
import { ExploreSpecificationBuilder } from './../../../shared/graphql/request/builders/specification/explore/explore-specification-builder';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ExploreVisualizationBuilder],
  selector: 'ht-custom-dashboard-panel',
  styleUrls: ['./custom-dashboard-panel.component.scss'],
  template: `
    <div class="panel">
      <ht-panel class="panel" (expandedChange)="this.onExpandedChange($event)">
        <ht-panel-header class="panel-header">
          <ht-panel-title [expanded]="expanded"
            ><span class="panel-title">{{ panel?.name || panel?.id }}</span>
          </ht-panel-title>
          <div class="actions-container" *ngIf="this.isOwner">
            <ht-icon
              title="Rename"
              class="panel-icon panel-edit"
              icon="${IconType.Edit}"
              (click)="onPanelEdit($event)"
            ></ht-icon>
            <ht-icon
              title="Delete"
              class="panel-icon panel-delete"
              icon="${IconType.Delete}"
              (click)="onPanelDelete($event)"
            ></ht-icon>
          </div>
        </ht-panel-header>
        <ht-panel-body>
          <div class="visualization-container" *ngIf="this.visualizationDashboard">
            <ht-application-aware-dashboard
              class="visualization-dashboard"
              [padding]="0"
              [json]="visualizationDashboard.json"
              (dashboardReady)="visualizationDashboard.onReady($event)"
            >
            </ht-application-aware-dashboard>
          </div>
        </ht-panel-body>
      </ht-panel>
    </div>
  `
})
export class CustomDashboardPanelComponent implements OnInit {
  @Input()
  public panel?: PanelData;

  @Input()
  public isOwner: boolean = true;

  @Output()
  public readonly editPanel: EventEmitter<string> = new EventEmitter();

  @Output()
  public readonly deletePanel: EventEmitter<{ panelName: string; panelId: string }> = new EventEmitter();

  public visualizationDashboard!: ExplorerGeneratedDashboard;
  public expanded: boolean = true;
  public constructor(private readonly exploreVisualizationBuilder: ExploreVisualizationBuilder) {}
  public ngOnInit(): void {
    this.panel!.series = this.tryDecodeExploreSeries(this.panel!.series);
    if (this.panel?.interval !== 'AUTO') {
      this.panel!.interval = this.panel!.interval;
      this.panel!.interval = new TimeDuration(this.panel!.interval.value, this.panel!.interval.unit);
    }

    const request = this.exploreVisualizationBuilder.buildRequest(this.panel!);

    this.visualizationDashboard = this.buildVisualizationDashboard(request);
  }
  private tryDecodeExploreSeries(series: ExploreSeries[]): ExploreSeries[] | [] {
    return series.map(singleSeries => ({
      specification: new ExploreSpecificationBuilder().exploreSpecificationForKey(
        singleSeries.specification.name,
        singleSeries.specification.aggregation
      ),
      visualizationOptions: {
        type: singleSeries.visualizationOptions.type
      }
    }));
  }

  private buildVisualizationDashboard(request: ExploreVisualizationRequest): ExplorerGeneratedDashboard {
    return {
      json: this.panel?.json!,
      onReady: dashboard => {
        dashboard.createAndSetRootDataFromModelClass(ExplorerVisualizationCartesianDataSourceModel);
        const dataSource = dashboard.getRootDataSource<ExplorerVisualizationCartesianDataSourceModel>()!;
        dataSource.request = request;
      }
    };
  }

  public onExpandedChange(expanded: boolean): void {
    this.expanded = expanded;
  }
  public onPanelEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.editPanel.emit(this.panel?.id);
  }
  public onPanelDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.deletePanel.emit({ panelName: this.panel!.name, panelId: this.panel!.id });
  }
}