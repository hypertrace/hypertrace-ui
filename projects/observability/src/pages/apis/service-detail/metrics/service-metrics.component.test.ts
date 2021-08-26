import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { mockDashboardProviders } from '@hypertrace/dashboards/testing';
import { NavigableDashboardComponent } from '@hypertrace/observability';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { ObservabilityEntityType } from '../../../../shared/graphql/model/schema/entity';
import { GraphQlEntityFilter } from '../../../../shared/graphql/model/schema/filter/entity/graphql-entity-filter';
import { EntitiesGraphqlQueryBuilderService } from '../../../../shared/graphql/request/handlers/entities/query/entities-graphql-query-builder.service';
import { ServiceDetailService } from '../service-detail.service';
import { ServiceMetricsComponent } from './service-metrics.component';
import { ServiceMetricsModule } from './service-metrics.module';

describe('ServiceMetricsComponent', () => {
  const expectedEntityFilter = new GraphQlEntityFilter('test-id', ObservabilityEntityType.Service);
  const createComponent = createComponentFactory({
    component: ServiceMetricsComponent,
    declareComponent: false,
    imports: [ServiceMetricsModule, IconLibraryTestingModule],
    providers: [
      mockProvider(ServiceDetailService, {
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
