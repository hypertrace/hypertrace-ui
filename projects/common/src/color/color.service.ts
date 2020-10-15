import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { rgb } from 'd3-color';
import { ColorPalette } from './color-palette';

export const DEFAULT_COLOR_PALETTE: InjectionToken<ColorPaletteDefinition> = new InjectionToken(
  'Default Color Palette'
);
export const ALTERNATE_COLOR_PALETTES: InjectionToken<ColorPaletteDefinition[]> = new InjectionToken(
  'Alternate Color Palettes'
);

export type ColorPaletteKey = string | symbol;

@Injectable({ providedIn: 'root' })
export class ColorService {
  private static readonly DEFAULT_PALETTE_KEY: unique symbol = Symbol('Default Palette Key');

  private readonly registeredPalettes: Map<ColorPaletteKey, string[]> = new Map();

  public constructor(
    @Inject(DEFAULT_COLOR_PALETTE) defaultPalette: ColorPaletteDefinition,
    @Optional() @Inject(ALTERNATE_COLOR_PALETTES) alternatePalettes: ColorPaletteDefinition[] | null
  ) {
    this.registerColorPalette(ColorService.DEFAULT_PALETTE_KEY, defaultPalette.colors);
    [defaultPalette, ...(alternatePalettes ?? [])].forEach(palette =>
      this.registerColorPalette(palette.key, palette.colors)
    );
  }

  public getColorPalette(colorPalette: ColorPaletteKey | string[] = ColorService.DEFAULT_PALETTE_KEY): ColorPalette {
    const basisColors = Array.isArray(colorPalette) ? colorPalette : this.getBasisColors(colorPalette);

    return new ColorPalette(basisColors);
  }

  public registerColorPalette(key: ColorPaletteKey, basisColors: string[]): void {
    this.registeredPalettes.set(key, basisColors);
  }

  public brighter(colorHex: string, basis: number): string {
    return rgb(colorHex).brighter(basis).hex();
  }

  public darker(colorHex: string, basis: number): string {
    return rgb(colorHex).darker(basis).hex();
  }

  private getBasisColors(key: ColorPaletteKey): string[] {
    return this.registeredPalettes.get(key) || this.registeredPalettes.get(ColorService.DEFAULT_PALETTE_KEY)!;
  }
}

export interface ColorPaletteDefinition {
  key: ColorPaletteKey;
  colors: string[];
}
