import { RENDERER_API } from '@hypertrace/hyperdash-angular';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';
import { DividerWidgetRendererComponent } from './divider-widget-renderer.component';

describe('Divider Widget Renderer Component', () => {
  let spectator: Spectator<DividerWidgetRendererComponent>;

  const createComponent = createComponentFactory<DividerWidgetRendererComponent>({
    component: DividerWidgetRendererComponent,
    providers: [
      {
        provide: RENDERER_API,
        useFactory: () => ({
          model: {},
          getTimeRange: jest.fn(),
          change$: EMPTY,
          dataRefresh$: EMPTY,
          timeRangeChanged$: EMPTY
        })
      }
    ],
    shallow: true
  });

  test('should use divider component', () => {
    spectator = createComponent();
    expect(spectator.query('ht-divider')).toExist();
  });
});
