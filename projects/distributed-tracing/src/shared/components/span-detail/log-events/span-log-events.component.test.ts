import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { DashboardModule } from '@hypertrace/dashboards';
import { mockDashboardProviders } from '@hypertrace/dashboards/testing';
import { NavigableDashboardComponent } from '@hypertrace/distributed-tracing';
import { EntitiesGraphqlQueryBuilderService } from '@hypertrace/observability';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { GraphQlDataSourceModule } from '../../../dashboard/data/graphql/graphql-data-source.module';
import { SpanLogEventsComponent } from './span-log-events.component';
import { SpanLogEventsModule } from './span-log-events.module';

describe('SpanLogEventsComponent', () => {
  const createComponent = createComponentFactory({
    component: SpanLogEventsComponent,
    declareComponent: false,
    imports: [SpanLogEventsModule, GraphQlDataSourceModule, DashboardModule, IconLibraryTestingModule],
    providers: [mockProvider(EntitiesGraphqlQueryBuilderService), ...mockDashboardProviders]
  });

  test('should create dashboard', () => {
    const spectator = createComponent();
    expect(spectator.query(NavigableDashboardComponent)).toExist();
    expect(spectator.query(NavigableDashboardComponent)!.navLocation).toBe('SPAN_LOG_EVENTS');
    expect(spectator.query(NavigableDashboardComponent)!.padding).toBe('0');
  });
});
