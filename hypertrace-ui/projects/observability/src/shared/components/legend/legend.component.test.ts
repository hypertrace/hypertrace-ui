import { createComponentFactory } from '@ngneat/spectator/jest';
import { LegendComponent, LegendFontSize, LegendLayout, LegendPosition } from './legend.component';

describe('Legend component', () => {
  const componentFactory = createComponentFactory({
    component: LegendComponent,
    shallow: true,
    providers: LegendComponent.buildProviders({
      layout: LegendLayout.Column,
      position: LegendPosition.Right,
      fontSize: LegendFontSize.ExtraSmall,
      series: [],
    }),
  });

  test('should render each value', () => {
    const spectator = componentFactory({
      providers: LegendComponent.buildProviders({
        layout: LegendLayout.Column,
        position: LegendPosition.Right,
        fontSize: LegendFontSize.Small,
        series: [
          {
            name: 'alpha',
            color: 'blue',
            data: {},
          },
          {
            name: 'beta',
            color: 'red',
            data: {},
          },
        ],
      }),
    });
    const entries = spectator.queryAll('.legend-entry');
    expect(entries.length).toBe(2);
    expect(entries[0]).toHaveText('alpha');
    expect(entries[0].querySelector<HTMLElement>('.legend-symbol')!.style.backgroundColor).toBe('blue');
    expect(entries[1]).toHaveText('beta');
    expect(entries[1].querySelector<HTMLElement>('.legend-symbol')!.style.backgroundColor).toBe('red');

    expect(spectator.query('.legend-entries')).toHaveClass('legend-column');
    expect(spectator.query('.legend-entry')).toHaveClass('font-size-small');
  });

  test('should render in requested orientation', () => {
    const spectator = componentFactory({
      providers: LegendComponent.buildProviders({
        layout: LegendLayout.Row,
        position: LegendPosition.Right,
        fontSize: LegendFontSize.ExtraSmall,
        series: [
          {
            name: 'alpha',
            color: 'blue',
            data: {},
          },
          {
            name: 'beta',
            color: 'red',
            data: {},
          },
        ],
      }),
    });
    expect(spectator.query('.legend-entries')).toHaveClass('legend-row');
  });
});
