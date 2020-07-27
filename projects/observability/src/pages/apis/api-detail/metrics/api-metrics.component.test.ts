import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { mockDashboardProviders } from '@hypertrace/dashboards/testing';
import { NavigableDashboardComponent } from '@hypertrace/distributed-tracing';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { ObservabilityEntityType } from '../../../../shared/graphql/model/schema/entity';
import { GraphQlEntityFilter } from '../../../../shared/graphql/model/schema/filter/entity/graphql-entity-filter';
import { EntitiesGraphqlQueryBuilderService } from '../../../../shared/graphql/request/handlers/entities/query/entities-graphql-query-builder.service';
import { ApiDetailService } from '../api-detail.service';
import { ApiMetricsComponent } from './api-metrics.component';
import { ApiMetricsModule } from './api-metrics.module';

describe('ApiMetricsComponent', () => {
  const expectedEntityFilter = new GraphQlEntityFilter('test-id', ObservabilityEntityType.Api);
  const createComponent = createComponentFactory({
    component: ApiMetricsComponent,
    declareComponent: false,
    imports: [ApiMetricsModule, IconLibraryTestingModule],
    providers: [
      mockProvider(ApiDetailService, {
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
