import { FormattingModule } from '@hypertrace/common';
import { tableCellDataProvider, tableCellProviders } from '@hypertrace/components';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MetricHealth } from '../../../../graphql/model/metrics/metric-health';
import { MetricTableCellParser } from './metric-table-cell-parser';
import { MetricTableCellRendererComponent } from './metric-table-cell-renderer.component';

describe('Metric table cell renderer component', () => {
  const buildComponent = createComponentFactory({
    component: MetricTableCellRendererComponent,
    imports: [FormattingModule],
    providers: [
      ...tableCellProviders(
        {
          id: 'test'
        },
        new MetricTableCellParser(undefined!)
      )
    ],
    shallow: true
  });

  test('should render a number', () => {
    const spectator = buildComponent({
      providers: [tableCellDataProvider(42)]
    });

    expect(spectator.element).toHaveText('42');
  });

  test('should render a number with unit', () => {
    const spectator = buildComponent({
      providers: [
        tableCellDataProvider({
          value: 42,
          units: 'ms'
        })
      ]
    });

    expect(spectator.element).toHaveText('42 ms');
  });

  test('should render a number with health', () => {
    const spectator = buildComponent({
      providers: [
        tableCellDataProvider({
          value: 76,
          health: MetricHealth.Healthy
        })
      ]
    });

    expect(spectator.element).toHaveText('76');
  });

  test('should render an empty object', () => {
    const spectator = buildComponent({
      providers: [tableCellDataProvider({})]
    });

    expect(spectator.element).toHaveText('-');
  });

  test('should render an undefined value', () => {
    const spectator = buildComponent();

    expect(spectator.element).toHaveText('-');
  });
});
