import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { NavigableDashboardComponent } from '../../shared/dashboard/dashboard-wrapper/navigable-dashboard.component';
import { mockDashboardProviders } from '../../test/dashboard-verification';
import { SpanListPageComponent } from './span-list.page.component';
import { SpanListPageModule } from './span-list.page.module';

describe('Span List Page Component', () => {
  const createComponent = createComponentFactory({
    declareComponent: false,
    component: SpanListPageComponent,
    imports: [SpanListPageModule, IconLibraryTestingModule],
    providers: mockDashboardProviders
  });

  test('should create a valid dashboard', () => {
    expect(createComponent().query(NavigableDashboardComponent)).toExist();
  });
});
