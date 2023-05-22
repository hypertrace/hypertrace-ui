import { CommonModule } from '@angular/common';
import { FactorySansProvider, ModuleWithProviders, NgModule } from '@angular/core';
import {
  FilterBarModule,
  FilterButtonModule,
  LetAsyncModule,
  PageHeaderModule,
  PanelModule,
  ToggleGroupModule
} from '@hypertrace/components';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { ExploreQueryEditorModule } from '../../shared/components/explore-query-editor/explore-query-editor.module';
import { ObservabilityDashboardModule } from '../../shared/dashboard/observability-dashboard.module';
import { EXPLORER_DASHBOARD_BUILDER_FACTORY } from './explorer-dashboard-builder';
import { ExplorerComponent } from './explorer.component';
import { CartesianExplorerClickHandlerModel } from './interactions/cartesian-explorer-click-handler.model';

@NgModule({
  imports: [
    CommonModule,
    ObservabilityDashboardModule,
    FilterBarModule,
    ExploreQueryEditorModule,
    PanelModule,
    PageHeaderModule,
    ToggleGroupModule,
    LetAsyncModule,
    FilterButtonModule,
    DashboardCoreModule.with({
      models: [CartesianExplorerClickHandlerModel]
    })
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
