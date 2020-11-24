import { MemoizeModule } from '@hypertrace/common';
import { TableComponent, TableControlsComponent } from '@hypertrace/components';
import { mockDashboardWidgetProviders } from '@hypertrace/dashboards/testing';
import { MetadataService } from '@hypertrace/distributed-tracing';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { TableWidgetRendererComponent } from './table-widget-renderer.component';

describe('Table Widget Renderer component', () => {
  const mockModel = {
    getData: jest.fn(() => of([{}]))
  };

  const createComponent = createComponentFactory<TableWidgetRendererComponent>({
    component: TableWidgetRendererComponent,
    shallow: true,
    imports: [MemoizeModule],
    providers: [mockProvider(MetadataService), ...mockDashboardWidgetProviders(mockModel)],
    declarations: [MockComponent(TableControlsComponent), MockComponent(TableComponent)]
  });

  test('renders the widget', () => {
    const spectator = createComponent();
    expect(spectator.query(TableControlsComponent)).toExist();
    expect(spectator.query(TableComponent)).toExist();
  });
});
