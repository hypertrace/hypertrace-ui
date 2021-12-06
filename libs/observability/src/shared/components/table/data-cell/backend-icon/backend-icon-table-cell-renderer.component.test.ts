import { NavigationService } from '@hypertrace/common';
import { tableCellColumnProvider, tableCellProviders } from '@hypertrace/components';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { BackendType } from '../../../../graphql/model/schema/entity';
import { ObservabilityIconType } from '../../../../icons/observability-icon-type';
import { EntityIconLookupService } from '../../../../services/entity/entity-icon-lookup.service';
import { BackendIconTableCellParser } from './backend-icon-table-cell-parser';
import { BackendIconTableCellRendererComponent } from './backend-icon-table-cell-renderer.component';

describe('Backend Icon table cell renderer component', () => {
  const mockInjector = {
    get: () => ({
      forBackendType: () => 'svg:cassandra'
    })
  };

  const buildComponent = createComponentFactory({
    component: BackendIconTableCellRendererComponent,
    providers: [
      mockProvider(NavigationService),
      mockProvider(EntityIconLookupService, {
        forBackendType: jest.fn().mockReturnValue(ObservabilityIconType.Cassandra)
      }),
      ...tableCellProviders(
        {
          id: 'test'
        },
        new BackendIconTableCellParser(mockInjector),
        0,
        BackendType.Cassandra
      )
    ],
    shallow: true
  });

  test('should render an icon', () => {
    const spectator = buildComponent();
    const element = spectator.query('.icon');

    expect(element).toExist();
    expect(spectator.component.value).toEqual(ObservabilityIconType.Cassandra);
  });

  test('should not add clickable class for clickable columns', () => {
    const spectator = buildComponent();

    const element = spectator.query('.clickable');

    expect(element).not.toHaveClass('clickable');
  });

  test('should add clickable class for columns with a click handler', () => {
    const spectator = buildComponent({
      providers: [
        tableCellColumnProvider({
          id: 'test',
          onClick: () => {
            /* NOOP */
          }
        })
      ]
    });

    const element = spectator.query('.clickable');

    expect(element).toHaveClass('clickable');
  });
});
