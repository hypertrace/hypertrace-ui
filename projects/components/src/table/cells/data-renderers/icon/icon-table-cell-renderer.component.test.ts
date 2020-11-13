import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IconLibraryTestingModule, IconType } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { IconModule } from '../../../../icon/icon.module';
import { TableCellIconParser } from '../../data-parsers/table-cell-icon-parser';
import { tableCellColumnProvider, tableCellProviders } from '../../test/cell-providers';
import { IconTableCellRendererComponent } from './icon-table-cell-renderer.component';

describe('Icon table cell renderer component', () => {
  const buildComponent = createComponentFactory({
    component: IconTableCellRendererComponent,
    imports: [IconModule, HttpClientTestingModule, IconLibraryTestingModule],
    providers: [
      mockProvider(NavigationService),
      ...tableCellProviders(
        {
          id: 'test'
        },
        new TableCellIconParser(undefined!),
        0,
        {
          icon: IconType.AddCircleOutline,
          label: 'I am Label'
        }
      )
    ],
    shallow: true
  });

  test('should render an icon', () => {
    const spectator = buildComponent();

    const element = spectator.query('.ht-icon');

    expect(element).toHaveExactText(IconType.AddCircleOutline);
    expect(element).toHaveAttribute('aria-label', 'I am Label');
  });

  test('should not add clickable class for clickable columns', () => {
    const spectator = buildComponent();

    const element = spectator.query('.clickable');

    expect(element).not.toHaveClass('clickable');
  });

  test('should add clickable class for columns without a click handler', () => {
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
