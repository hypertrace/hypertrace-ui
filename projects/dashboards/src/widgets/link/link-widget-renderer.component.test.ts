import { RENDERER_API } from '@hypertrace/hyperdash-angular';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';
import { LinkWidgetRendererComponent } from './link-widget-renderer.component';
import { LinkWidgetModel } from './link-widget.model';

describe('Link widget renderer component', () => {
  let spectator: Spectator<LinkWidgetRendererComponent>;
  let mockModel: Partial<LinkWidgetModel> = {};
  const createComponent = createComponentFactory<LinkWidgetRendererComponent>({
    component: LinkWidgetRendererComponent,
    providers: [
      {
        provide: RENDERER_API,
        useFactory: () => ({
          model: mockModel,
          getTimeRange: jest.fn(),
          change$: EMPTY,
          dataRefresh$: EMPTY,
          timeRangeChanged$: EMPTY
        })
      }
    ],
    shallow: true
  });

  beforeEach(() => {
    mockModel = {};
  });

  test('Link should be displayed as expected if url and displayText are defined', () => {
    mockModel.url = '#';
    mockModel.displayText = 'Test';
    spectator = createComponent();

    expect(spectator.query('ht-link')).toExist();
    expect(spectator.component.getDisplayText()).toEqual('Test');
  });

  test('Link should use url as displayText if displayText is undefined', () => {
    mockModel.url = '#';
    spectator = createComponent();

    expect(spectator.query('ht-link')).toExist();
    expect(spectator.component.getDisplayText()).toEqual(mockModel.url);
  });
});
