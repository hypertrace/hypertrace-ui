import { FormattingModule } from '@hypertrace/common';
import { tableCellDataProvider, tableCellProviders } from '@hypertrace/components';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { SpanNameTableCellParser } from './span-name-table-cell-parser';
import { SpanNameTableCellRendererComponent } from './span-name-table-cell-renderer.component';

describe('Span name table cell renderer component', () => {
  const spanNameData = {
    serviceName: 'test-entity',
    protocolName: 'test-protocol',
    apiName: 'test-span-name'
  };

  const buildComponent = createComponentFactory({
    component: SpanNameTableCellRendererComponent,
    imports: [FormattingModule],
    providers: [
      tableCellProviders(
        {
          id: 'test'
        },
        new SpanNameTableCellParser(undefined!),
        0,
        spanNameData
      )
    ],
    shallow: true
  });

  test('should render span name without color and error icon and build tooltip ', () => {
    const spectator = buildComponent();

    const tooltip = `${spanNameData.serviceName} ${spanNameData.protocolName} ${spanNameData.apiName}`;

    expect(spectator.component.value).toEqual(spanNameData);
    expect(spectator.component.tooltip).toEqual(tooltip);
    expect(spectator.query('.service-name')).toHaveText('test-entity');
    expect(spectator.query('.protocol-name')).toHaveText('test-protocol');
    expect(spectator.query('.span-name')).toHaveText('test-span-name');
    expect(spectator.query('.color-bar')).not.toExist();
    expect(spectator.query('.error-icon')).not.toExist();
  });

  test('should render span name with color and error icon and build tooltip ', () => {
    const spanNameDataWithColor = {
      ...spanNameData,
      color: 'blue',
      hasError: true
    };
    const spectator = buildComponent({
      providers: [tableCellDataProvider(spanNameDataWithColor)]
    });

    const tooltip = `${spanNameData.serviceName} ${spanNameData.protocolName} ${spanNameData.apiName}`;

    expect(spectator.component.value).toEqual(spanNameDataWithColor);
    expect(spectator.component.tooltip).toEqual(tooltip);
    expect(spectator.query('.service-name')).toHaveText('test-entity');
    expect(spectator.query('.protocol-name')).toHaveText('test-protocol');
    expect(spectator.query('.span-name')).toHaveText('test-span-name');
    expect(spectator.query('.color-bar')).toExist();
    expect(spectator.query('.error-icon')).toExist();
  });

  test('should render log icon ', () => {
    const spanNameDataWithColor = {
      ...spanNameData,
      hasLogs: true
    };
    const spectator = buildComponent({
      providers: [tableCellDataProvider(spanNameDataWithColor)]
    });
    expect(spectator.query('.log-icon')).toExist();
  });
});
