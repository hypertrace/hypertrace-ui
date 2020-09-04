import { RENDERER_API } from '@hypertrace/hyperdash-angular';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { EMPTY, of } from 'rxjs';
import { HighlightedLabelWidgetRendererComponent } from './highlighted-label-widget-renderer.component';
import { HighlightedLabelWidgetModel } from './highlighted-label-widget.model';
import { HighlightedLabelWidgetModule } from './highlighted-label-widget.module';

describe('Highlighted label widget renderer component', () => {
  let spectator: Spectator<HighlightedLabelWidgetRendererComponent>;
  const mockModel: Partial<HighlightedLabelWidgetModel> = {};
  const createComponent = createComponentFactory<HighlightedLabelWidgetRendererComponent>({
    component: HighlightedLabelWidgetRendererComponent,
    imports: [HighlightedLabelWidgetModule],
    providers: [
      {
        provide: RENDERER_API,
        useFactory: () => ({
          model: mockModel,
          getDataFromModelDataSource: () => of({ a: 'first value', b: 20 }),
          getTimeRange: jest.fn(),
          change$: EMPTY,
          dataRefresh$: EMPTY,
          timeRangeChanged$: EMPTY
        })
      }
    ],
    declareComponent: false
  });

  beforeEach(() => {
    mockModel.labelTemplate = 'test {a} and {b}';
    spectator = createComponent();
  });

  test('should render all parts correctly', () => {
    const spans = spectator.queryAll('.highlighted-label span');
    ['test', 'first value', 'and', '20'].map((token, i) => expect(spans[i]).toContainText(token));
  });

  test('should highlight necessary parts correctly', () => {
    const highlightedSections = spectator.queryAll('.highlight');
    expect(highlightedSections.length).toBe(2);
    expect(highlightedSections[0]).toContainText('first value');
    expect(highlightedSections[1]).toContainText('20');
  });
});
