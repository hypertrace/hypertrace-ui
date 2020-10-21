import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { Filter } from '@hypertrace/components';
import { DashboardPersistenceService } from '@hypertrace/dashboards';
import { Dashboard, ModelJson } from '@hypertrace/hyperdash';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, defaultIfEmpty, map } from 'rxjs/operators';
import { AttributeMetadata } from '../../graphql/model/metadata/attribute-metadata';
import { GraphQlFilter } from '../../graphql/model/schema/filter/graphql-filter';
import { GraphQlFilterBuilderService } from '../../services/filter-builder/graphql-filter-builder.service';
import { MetadataService } from '../../services/metadata/metadata.service';
import { GraphQlFilterDataSourceModel } from '../data/graphql/filter/graphql-filter-data-source.model';

@Component({
  selector: 'ht-navigable-dashboard',
  styleUrls: ['./navigable-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="navigable-dashboard" *htLoadAsync="this.dashboardJson$ as dashboardJson">
      <ht-filter-bar
        class="filter-bar"
        *ngIf="this.filterConfig?.filterBar"
        [attributes]="this.attributes$ | async"
        [syncWithUrl]="true"
        (filtersChange)="this.onFilterChange($event)"
      >
      </ht-filter-bar>
      <ht-application-aware-dashboard
        class="dashboard"
        [json]="dashboardJson"
        (dashboardReady)="this.onDashboardReady($event)"
      >
      </ht-application-aware-dashboard>
    </div>
  `
})
export class NavigableDashboardComponent implements OnChanges {
  @Input()
  public readonly defaultJson?: ModelJson;

  @Input()
  public navLocation?: string;

  @Input()
  public filterConfig?: NavigableDashboardFilterConfig;

  @Output()
  public readonly dashboardReady: EventEmitter<Dashboard> = new EventEmitter();

  public dashboardJson$?: Observable<ModelJson>;
  public attributes$: Observable<AttributeMetadata[]> = of([]);
  private explicitFilters: Filter[] = [];
  private dashboard?: Dashboard;

  private get implicitFilters(): GraphQlFilter[] {
    return this.filterConfig?.implicitFilters ?? [];
  }

  public constructor(
    private readonly metadataService: MetadataService,
    private readonly dashboardPersistenceService: DashboardPersistenceService,
    private readonly graphQlFilterBuilderService: GraphQlFilterBuilderService
  ) {}

  public ngOnChanges(changeObject: TypedSimpleChanges<this>): void {
    if (changeObject.navLocation) {
      const persistedDashboard$ =
        this.navLocation === undefined || this.navLocation === null
          ? EMPTY
          : this.dashboardPersistenceService.getForLocation(this.navLocation);
      this.dashboardJson$ = persistedDashboard$.pipe(
        map(dashboard => dashboard.content),
        catchError(() => EMPTY),
        defaultIfEmpty(this.defaultJson)
      );
    }

    if (changeObject.filterConfig) {
      this.attributes$ = this.filterConfig?.filterBar
        ? this.metadataService.getFilterAttributes(this.filterConfig.filterBar.scope)
        : of([]);
    }
  }

  public onDashboardReady(dashboard: Dashboard): void {
    this.dashboard = dashboard;
    this.applyFiltersToDashboard(dashboard, this.explicitFilters);
    this.dashboardReady.emit(dashboard);
  }

  public onFilterChange(explicitFilters: Filter[]): void {
    this.explicitFilters = explicitFilters;
    if (this.dashboard) {
      this.applyFiltersToDashboard(this.dashboard, explicitFilters);
    }
  }

  public applyFiltersToDashboard(dashboard: Dashboard, explicitFilters: Filter[]): void {
    const rootDataSource = dashboard.getRootDataSource<GraphQlFilterDataSourceModel>();
    rootDataSource
      ?.clearFilters()
      .addFilters(...this.implicitFilters, ...this.graphQlFilterBuilderService.buildGraphQlFilters(explicitFilters));
    dashboard.refresh();
  }
}

export interface NavigableDashboardFilterConfig {
  filterBar?: {
    scope: string;
  };
  implicitFilters?: GraphQlFilter[];
}
