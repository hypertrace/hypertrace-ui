import { CommonModule } from '@angular/common';
import { FactorySansProvider, ModuleWithProviders, NgModule } from '@angular/core';
import { FilterBarModule, PageHeaderModule, PanelModule, ToggleGroupModule } from '@hypertrace/components';
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
    PageHeaderModule,
    ToggleGroupModule
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
