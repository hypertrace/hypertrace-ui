import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { mockDashboardProviders } from '@hypertrace/dashboards/testing';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { NavigableDashboardComponent } from '../../../../shared/dashboard/dashboard-wrapper/navigable-dashboard.component';
import { ObservabilityEntityType } from '../../../../shared/graphql/model/schema/entity';
import { GraphQlEntityFilter } from '../../../../shared/graphql/model/schema/filter/entity/graphql-entity-filter';
import { EntitiesGraphqlQueryBuilderService } from '../../../../shared/graphql/request/handlers/entities/query/entities-graphql-query-builder.service';
import { BackendDetailService } from '../backend-detail.service';
import { BackendMetricsComponent } from './backend-metrics.component';
import { BackendMetricsModule } from './backend-metrics.module';

describe('BackendMetricsComponent', () => {
  const expectedEntityFilter = new GraphQlEntityFilter('test-id', ObservabilityEntityType.Backend);
  const createComponent = createComponentFactory({
    component: BackendMetricsComponent,
    declareComponent: false,
    imports: [BackendMetricsModule, IconLibraryTestingModule],
    providers: [
      mockProvider(BackendDetailService, {
        entityFilter$: of(expectedEntityFilter)
      }),
      mockProvider(EntitiesGraphqlQueryBuilderService),
      ...mockDashboardProviders
    ]
  });

  test('should create dashboard and apply filters', () => {
    const spectator = createComponent();
    expect(spectator.query(NavigableDashboardComponent)?.filterConfig).toEqual({
      implicitFilters: [expectedEntityFilter]
    });
  });
});
