import { GreetingLabelComponent } from '@hypertrace/components';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { mockDashboardWidgetProviders } from '../../test/dashboard-verification';
import { GreetingLabelWidgetRendererComponent } from './greeting-label-widget-renderer.component';
import { GreetingLabelWidgetModel } from './greeting-label-widget.model';

describe('Greeting label widget renderer component', () => {
  let spectator: Spectator<GreetingLabelWidgetRendererComponent>;
  const mockModel: Partial<GreetingLabelWidgetModel> = {};
  const createComponent = createComponentFactory<GreetingLabelWidgetRendererComponent>({
    component: GreetingLabelWidgetRendererComponent,
    entryComponents: [GreetingLabelComponent],
    providers: [...mockDashboardWidgetProviders(mockModel)]
  });

  beforeEach(() => {
    mockModel.suffixLabel = ', test';
  });

  test('should render greeting label correctly', () => {
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(18);
    spectator = createComponent();
    expect(spectator.query('ht-greeting-label')).toHaveText('Good Evening, test');
  });
});
