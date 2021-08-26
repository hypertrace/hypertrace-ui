import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { mockDashboardProviders } from '@hypertrace/dashboards/testing';
import { EntitiesGraphqlQueryBuilderService, NavigableDashboardComponent } from '@hypertrace/observability';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { HomeComponent } from './home.component';
import { HomeModule } from './home.module';

describe('Home Dashboard', () => {
  const createComponent = createComponentFactory({
    component: HomeComponent,
    declareComponent: false,
    imports: [HomeModule, IconLibraryTestingModule],
    providers: [mockProvider(EntitiesGraphqlQueryBuilderService), ...mockDashboardProviders]
  });

  test('should default to valid json', () => {
    expect(createComponent().query(NavigableDashboardComponent)).toExist();
  });
});
