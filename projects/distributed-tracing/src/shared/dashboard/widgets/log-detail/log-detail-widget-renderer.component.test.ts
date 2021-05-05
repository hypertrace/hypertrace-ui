import { Dictionary, FormattingModule } from '@hypertrace/common';
import { ListViewComponent, LoadAsyncModule } from '@hypertrace/components';
import { mockDashboardWidgetProviders } from '@hypertrace/dashboards/testing';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { LogDetailWidgetRendererComponent } from './log-detail-widget-renderer.component';
import { LogDetailWidgetModel } from './log-detail-widget.model';

describe('log detail widget renderer component', () => {
  let mockModel: Partial<LogDetailWidgetModel> = {};
  const buildComponent = createComponentFactory({
    component: LogDetailWidgetRendererComponent,
    providers: [],
    imports: [FormattingModule, LoadAsyncModule],
    declarations: [MockComponent(ListViewComponent)],
    shallow: true
  });
  const attributes: Dictionary<unknown> = {
    key1: 1,
    key2: 2
  };

  test('should render list view with provided data', () => {
    mockModel = {
      getData: jest.fn(() => of(attributes))
    };
    const spectator = buildComponent({
      providers: [...mockDashboardWidgetProviders(mockModel)]
    });
    expect(spectator.query('.content')).toExist();
    expect(spectator.query(ListViewComponent)!.header).toEqual(spectator.component.header);
    expect(spectator.query(ListViewComponent)!.records).toEqual([
      {
        key: 'key1',
        value: 1
      },
      {
        key: 'key2',
        value: 2
      }
    ]);
  });
});
