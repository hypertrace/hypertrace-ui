import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { HighlightedLabelComponent } from './highlighted-label.component';
import { HighlightedLabelModule } from './highlighted-label.module';

describe('Highlighted Label component', () => {
  let spectator: Spectator<HighlightedLabelComponent>;

  const createHost = createHostFactory({
    declareComponent: false,
    component: HighlightedLabelComponent,
    imports: [HighlightedLabelModule]
  });

  test('should render interpolated string correctly', () => {
    spectator = createHost(
      `<ht-highlighted-label [data]="data" [templateString]="templateString"></ht-highlighted-label>`,
      {
        hostProps: {
          data: { a: 'first value', b: 2 },
          templateString: 'test {a} and {b}'
        }
      }
    );

    expect(spectator.component.tokens).toEqual([
      { value: 'test ', highlight: false },
      { value: 'first value', highlight: true },
      { value: ' and ', highlight: false },
      { value: '2', highlight: true }
    ]);

    const highlightedSections = spectator.queryAll('.highlight');
    expect(highlightedSections.length).toBe(2);
    expect(highlightedSections[0]).toContainText('first value');
    expect(highlightedSections[1]).toContainText('2');
  });
});
