import { CommonModule } from '@angular/common';
import { Inject, InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { FilterBarModule, LoadAsyncModule } from '@hypertrace/components';
import { DashboardPersistenceService } from '@hypertrace/dashboards';
import { ModelJson } from '@hypertrace/hyperdash';
import { DashboardCoreModule, DashboardEditorModule } from '@hypertrace/hyperdash-angular';
import { ApplicationAwareDashboardComponent } from './application-aware-dashboard.component';
import { NavigableDashboardComponent } from './navigable-dashboard.component';

const DEFAULT_DASHBOARDS = new InjectionToken<DashboardDefaultConfiguration[]>('DEFAULT_DASHBOARDS');

@NgModule({
  imports: [CommonModule, DashboardCoreModule, DashboardEditorModule, LoadAsyncModule, FilterBarModule],
  declarations: [ApplicationAwareDashboardComponent, NavigableDashboardComponent],
  providers: [{ provide: DEFAULT_DASHBOARDS, useValue: [], multi: true }],
  exports: [ApplicationAwareDashboardComponent, NavigableDashboardComponent]
})
// tslint:disable-next-line: no-unnecessary-class
export class NavigableDashboardModule {
  public constructor(
    dashboardPersistenceService: DashboardPersistenceService,
    @Inject(DEFAULT_DASHBOARDS) defaultDashboards: DashboardDefaultConfiguration[][]
  ) {
    defaultDashboards
      .flat()
      .forEach(({ json, location }) =>
        dashboardPersistenceService.setDefaultForLocation(location, { content: json, tags: [], name: location })
      );
  }

  public static withDefaultDashboards(
    ...dashboardDefaults: DashboardDefaultConfiguration[]
  ): ModuleWithProviders<NavigableDashboardModule> {
    return {
      ngModule: NavigableDashboardModule,
      providers: [
        {
          provide: DEFAULT_DASHBOARDS,
          useValue: dashboardDefaults,
          multi: true
        }
      ]
    };
  }
}

export interface DashboardDefaultConfiguration {
  json: ModelJson;
  location: string;
}
