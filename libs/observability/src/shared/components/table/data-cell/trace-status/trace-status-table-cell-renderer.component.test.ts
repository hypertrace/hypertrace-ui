import { FormattingModule } from '@hypertrace/common';
import { tableCellProviders } from '@hypertrace/components';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { TraceStatus, TraceStatusType } from '../../../../../shared/graphql/model/schema/trace';
import { TraceStatusTableCellParser } from './trace-status-table-cell-parser';
import { TraceStatusTableCellRendererComponent } from './trace-status-table-cell-renderer.component';

describe('Trace status table cell renderer component', () => {
  const traceStatus: TraceStatus = {
    status: TraceStatusType.FAIL,
    statusCode: '404',
    statusMessage: 'Not Found'
  };

  const buildComponent = createComponentFactory({
    component: TraceStatusTableCellRendererComponent,
    imports: [FormattingModule],
    providers: [
      tableCellProviders(
        {
          id: 'test'
        },
        new TraceStatusTableCellParser(undefined!),
        0,
        traceStatus
      )
    ],
    shallow: true
  });

  test('should render trace status with correct data', () => {
    const spectator = buildComponent();

    expect(spectator.component.value).toEqual(traceStatus);
    expect(spectator.query('.trace-status')).toHaveText('404 - Not Found');
  });
});
