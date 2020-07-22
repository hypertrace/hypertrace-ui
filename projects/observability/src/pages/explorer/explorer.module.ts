import { CommonModule } from '@angular/common';
import { FactorySansProvider, ModuleWithProviders, NgModule } from '@angular/core';
import { PageHeaderModule, PanelModule, ToggleButtonModule } from '@hypertrace/components';
import { FilterBarModule } from '@hypertrace/distributed-tracing';
import { ExploreQueryEditorModule } from '../../shared/components/explore-query-editor/explore-query-editor.module';
import { ObservabilityDashboardModule } from '../../shared/dashboard/observability-dashboard.module';
import { EXPLORER_DASHBOARD_BUILDER_FACTORY } from './explorer-dashboard-builder';
import { ExplorerComponent } from './explorer.component';

@NgModule({
  imports: [
    CommonModule,
    ObservabilityDashboardModule,
    FilterBarModule,
    ExploreQueryEditorModule,
    PanelModule,
    ToggleButtonModule,
    PageHeaderModule
  ],
  declarations: [ExplorerComponent]
})
// tslint:disable-next-line: no-unnecessary-class
export class ExplorerModule {
  public static withDashboardBuilderFactory(builderFactory: FactorySansProvider): ModuleWithProviders<ExplorerModule> {
    return {
      ngModule: ExplorerModule,
      providers: [
        {
          provide: EXPLORER_DASHBOARD_BUILDER_FACTORY,
          deps: builderFactory.deps,
          useFactory: (...deps: unknown[]) => ({
            build: () => builderFactory.useFactory(...deps)
          })
        }
      ]
    };
  }
}
