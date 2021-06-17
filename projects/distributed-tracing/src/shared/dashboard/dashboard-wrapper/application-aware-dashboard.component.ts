import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { Dictionary, TimeRangeService } from '@hypertrace/common';
import { Dashboard, ModelJson } from '@hypertrace/hyperdash';
import { TypedSimpleChanges } from '@hypertrace/hyperdash-angular/util/angular-change-object';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GraphQlFilterDataSourceModel } from '../data/graphql/filter/graphql-filter-data-source.model';

@Component({
  selector: 'ht-application-aware-dashboard',
  styleUrls: ['./application-aware-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="application-aware-dashboard" [style.padding.px]="this.padding">
      <hda-dashboard
        *ngIf="this.json"
        [json]="this.json"
        (dashboardReady)="this.onDashboardReady($event)"
        (widgetSelectionChange)="this.onWidgetSelectionChange($event)"
      >
      </hda-dashboard>
      <hda-model-editor
        *ngIf="this.editable && this.widgetSelection"
        class="model-editor"
        [model]="this.widgetSelection"
        (modelChange)="this.onDashboardUpdated()"
      >
      </hda-model-editor>
    </div>
  `
})
export class ApplicationAwareDashboardComponent implements OnDestroy, OnChanges {
  @Input()
  public json?: ModelJson;

  @Input()
  public editable: boolean = false;

  @Input()
  public padding?: number;

  @Input()
  public variables?: Dictionary<unknown>;

  @Output()
  public readonly dashboardReady: EventEmitter<Dashboard> = new EventEmitter();

  @Output()
  public readonly jsonChange: EventEmitter<ModelJson> = new EventEmitter();

  public dashboard?: Dashboard;
  public widgetSelection?: object;
  private readonly destroyDashboard$: Subject<void> = new Subject();

  public constructor(private readonly timeRangeService: TimeRangeService) {}

  public onDashboardReady(dashboard: Dashboard): void {
    this.destroyDashboard$.next();

    dashboard.createAndSetRootDataFromModelClass(GraphQlFilterDataSourceModel);
    this.applyVariablesToDashboard(dashboard, this.variables ?? undefined);
    this.dashboard = dashboard;
    this.widgetSelection = dashboard.root;

    this.timeRangeService
      .getTimeRangeAndChanges()
      .pipe(takeUntil(this.destroyDashboard$))
      .subscribe(timeRange => dashboard.setTimeRange(timeRange));

    this.dashboardReady.emit(dashboard);
  }

  public ngOnDestroy(): void {
    this.destroyDashboard$.next();
    this.destroyDashboard$.complete();
  }

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.variables && this.dashboard) {
      this.applyVariablesToDashboard(this.dashboard, this.variables ?? undefined);
    }
  }

  public onWidgetSelectionChange(newSelection: object): void {
    this.widgetSelection = newSelection;
  }

  public onDashboardUpdated(): void {
    this.jsonChange.emit(this.dashboard!.serialize() as ModelJson);
  }

  private applyVariablesToDashboard(dashboard: Dashboard, variables: Dictionary<unknown> = {}): void {
    for (const key of Object.keys(variables)) {
      dashboard.setVariable(key, variables[key]);
    }
    dashboard.refresh();
  }
}
