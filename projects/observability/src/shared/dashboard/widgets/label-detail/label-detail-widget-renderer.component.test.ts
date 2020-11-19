import { FormattingModule } from '@hypertrace/common';
import { LoadAsyncModule, TitledContentComponent } from '@hypertrace/components';
import { mockDashboardWidgetProviders } from '@hypertrace/dashboards/testing';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { LabelDetailComponent } from './../../../components/label-detail/label-detail.component';
import { LabelDetailWidgetRendererComponent } from './label-detail-widget-renderer.component';
import { LabelDetailWidgetModel } from './label-detail-widget.model';
import { IconType } from '@hypertrace/assets-library';

describe('Label Detail widget renderer component', () => {
  let mockModel: Partial<LabelDetailWidgetModel> = {};
  const componentFactory = createComponentFactory({
    component: LabelDetailWidgetRendererComponent,
    shallow: true,
    imports: [FormattingModule, LoadAsyncModule],
    declarations: [MockComponent(LabelDetailComponent), MockComponent(TitledContentComponent)]
  });

  test('should render provided data with title', () => {
    mockModel = {
      title: 'Test Title',
      label: 'Test Label',
      icon: IconType.Add,
      description: 'This is a test description',
      getData: jest.fn(() =>
        of(['Additional Detail 1', 'Additional Detail 2'])
      )
    };

    const spectator = componentFactory({
      providers: [...mockDashboardWidgetProviders(mockModel)]
    });

    expect(spectator.query(TitledContentComponent)!.title).toBe('TEST TITLE');

    const labelDetailComponent = spectator.query(LabelDetailComponent);
    expect(labelDetailComponent).toExist();
    expect(labelDetailComponent!.label).toEqual('Test Label');
    expect(labelDetailComponent!.icon).toEqual(IconType.Add);
    expect(labelDetailComponent!.description).toEqual('This is a test description');
    expect(labelDetailComponent!.additionalDetails).toEqual(['Additional Detail 1', 'Additional Detail 2']);
  });
});
