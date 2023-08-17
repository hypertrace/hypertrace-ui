import { CommonModule } from '@angular/common';
import { FactorySansProvider, ModuleWithProviders, NgModule } from '@angular/core';
import {
  FilterBarModule,
  LetAsyncModule,
  MenuDropdownModule,
  PageHeaderModule,
  PanelModule,
  ToggleGroupModule
} from '@hypertrace/components';
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
    MenuDropdownModule,
    PanelModule,
    PageHeaderModule,
    ToggleGroupModule,
    LetAsyncModule
  ],
  declarations: [ExplorerComponent]
})
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
