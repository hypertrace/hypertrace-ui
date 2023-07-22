import { FormattingModule } from '@hypertrace/common';
import { ButtonSize, CopyToClipboardComponent } from '@hypertrace/components';
import { byText, createComponentFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { TableCellStringParser } from '../../data-parsers/table-cell-string-parser';
import { tableCellColumnProvider, tableCellDataProvider, tableCellProviders } from '../../test/cell-providers';
import { TextWithCopyActionTableCellRendererComponent } from './text-with-copy-table-cell-renderer.component';

describe('Text with copy action table cell renderer component', () => {
  const buildComponent = createComponentFactory({
    component: TextWithCopyActionTableCellRendererComponent,
    imports: [FormattingModule],
    declarations: [MockComponent(CopyToClipboardComponent)],
    providers: [
      tableCellProviders(
        {
          id: 'test'
        },
        new TableCellStringParser(undefined!)
      )
    ],
    shallow: true
  });

  test('should render a plain string', () => {
    const spectator = buildComponent({
      providers: [tableCellDataProvider('test-text')]
    });

    expect(spectator.query('.text')).toHaveText('test-text');
  });

  test('should render a missing string', () => {
    const spectator = buildComponent();

    expect(spectator.query('.text')).toHaveText('');
  });

  test('should render the copy action button as expected', () => {
    const spectator = buildComponent({ providers: [tableCellDataProvider('test-text')] });
    expect(spectator.query('.copy-button')).toExist();
    expect(spectator.query(CopyToClipboardComponent)?.label).toBe('');
    expect(spectator.query(CopyToClipboardComponent)?.size).toBe(ButtonSize.ExtraSmall);
    expect(spectator.query(CopyToClipboardComponent)?.text).toBe('test-text');
  });

  test('should not render the copy action button if string is empty', () => {
    const spectator = buildComponent({ providers: [tableCellDataProvider('')] });
    expect(spectator.query('.copy-button')).not.toExist();
  });

  test('should add clickable class for clickable columns', () => {
    const spectator = buildComponent({
      providers: [
        tableCellDataProvider('test-text'),
        tableCellColumnProvider({
          id: 'test',
          onClick: () => {
            /* NOOP */
          }
        })
      ]
    });

    expect(spectator.query('.text-with-copy-action-cell')).toHaveClass('clickable');
  });

  test('should not add clickable class for columns without a click handler', () => {
    const spectator = buildComponent({
      providers: [tableCellDataProvider('test-text')]
    });

    expect(spectator.query(byText('test-text'))).not.toHaveClass('clickable');
  });
});
