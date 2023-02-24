import { createServiceFactory } from '@ngneat/spectator/jest';
import { ColorPalette } from './color-palette';
import { ALTERNATE_COLOR_PALETTES, ColorService, DEFAULT_COLOR_PALETTE } from './color.service';

describe('Color service', () => {
  const defaultColors = ['rgb(0, 0, 0)', 'rgb(255, 255, 255)'];
  const alternateColors = ['rgb(5, 5, 5)', 'rgb(250, 250, 250)'];
  const createService = createServiceFactory({
    service: ColorService,
    providers: [
      {
        provide: DEFAULT_COLOR_PALETTE,
        useValue: {
          key: 'default',
          colors: defaultColors
        }
      },
      {
        provide: ALTERNATE_COLOR_PALETTES,
        multi: true,
        useValue: {
          key: 'alternate',
          colors: alternateColors
        }
      }
    ]
  });
  test('should support a default palette if no palette is requested', () => {
    const spectator = createService();
    expect(spectator.service.getColorPalette()).toEqual(new ColorPalette(defaultColors));
  });

  test('should use default palette if requested palette is not registered', () => {
    const spectator = createService();
    expect(spectator.service.getColorPalette('foo')).toEqual(new ColorPalette(defaultColors));
  });

  test('should support fetching alternate palette', () => {
    const spectator = createService();
    expect(spectator.service.getColorPalette('alternate')).toEqual(new ColorPalette(alternateColors));
  });

  test('should support registering and using a color palette', () => {
    const spectator = createService();
    const paletteColors = ['rgb(20, 20, 20)', 'rgb(50, 50, 50)'];
    spectator.service.registerColorPalette('foo', paletteColors);
    expect(spectator.service.getColorPalette('foo')).toEqual(new ColorPalette(paletteColors));
  });

  test('should support building a custom palette that is not registered', () => {
    const spectator = createService();
    const paletteColors = ['rgb(20, 20, 20)', 'rgb(50, 50, 50)'];
    expect(spectator.service.getColorPalette(paletteColors)).toEqual(new ColorPalette(paletteColors));
  });
});
