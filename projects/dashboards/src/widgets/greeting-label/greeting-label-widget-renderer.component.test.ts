import { GreetingLabelComponent } from '@hypertrace/components';
import { RENDERER_API } from '@hypertrace/hyperdash-angular';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';
import { GreetingLabelWidgetRendererComponent } from './greeting-label-widget-renderer.component';
import { GreetingLabelWidgetModel } from './greeting-label-widget.model';

describe('Greeting label widget renderer component', () => {
  let spectator: Spectator<GreetingLabelWidgetRendererComponent>;
  const mockModel: Partial<GreetingLabelWidgetModel> = {};
  const createComponent = createComponentFactory<GreetingLabelWidgetRendererComponent>({
    component: GreetingLabelWidgetRendererComponent,
    entryComponents: [GreetingLabelComponent],
    providers: [
      {
        provide: RENDERER_API,
        useFactory: () => ({
          model: mockModel,
          getDataFromModelDataSource: EMPTY,
          getTimeRange: jest.fn(),
          change$: EMPTY,
          dataRefresh$: EMPTY,
          timeRangeChanged$: EMPTY
        })
      }
    ]
  });

  beforeEach(() => {
    mockModel.suffixLabel = ', test';
  });

  test('should render greeting label correctly', () => {
    spyOn(Date.prototype, 'getHours').and.returnValue(18);
    spectator = createComponent();
    expect(spectator.query('htc-greeting-label')).toHaveText('Good Evening, test');
  });
});
