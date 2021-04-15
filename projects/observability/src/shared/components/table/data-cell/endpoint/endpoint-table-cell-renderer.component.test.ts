import { NavigationService } from '@hypertrace/common';
import {
  IconModule,
  tableCellDataProvider,
  TableCellNoOpParser,
  tableCellProviders,
  TooltipDirective
} from '@hypertrace/components';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { EndpointTableCellRendererComponent } from './endpoint-table-cell-renderer.component';

describe('Endpoint table cell renderer component', () => {
  const buildComponent = createComponentFactory({
    component: EndpointTableCellRendererComponent,
    providers: [
      tableCellProviders(
        {
          id: 'test'
        },
        new TableCellNoOpParser(undefined!)
      ),
      mockProvider(NavigationService)
    ],
    declarations: [MockComponent(TooltipDirective)],
    imports: [IconModule],
    shallow: true
  });

  test('should render endpoint value but not error icon', () => {
    const spectator = buildComponent({
      providers: [tableCellDataProvider({ value: ['endpoint', 0] })]
    });

    expect(spectator.component.endpointValue).toBe('endpoint');
    expect(spectator.component.errorCount).toBe(0);
    expect(spectator.query('.endpoint-value')).toContainText('endpoint');
    expect(spectator.query('.error-icon')).not.toExist();
  });

  test('should render both endpoint value and error icon', () => {
    const spectator = buildComponent({
      providers: [tableCellDataProvider({ value: ['endpoint1', 1] })]
    });

    expect(spectator.component.endpointValue).toBe('endpoint1');
    expect(spectator.component.errorCount).toBe(1);
    expect(spectator.query('.endpoint-value')).toContainText('endpoint1');
    expect(spectator.query('.error-icon')).toExist();
  });
});
