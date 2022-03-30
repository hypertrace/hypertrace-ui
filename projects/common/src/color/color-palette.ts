import { rgb } from 'd3-color';
import { interpolateRgbBasis, quantize } from 'd3-interpolate';
import { hashCode } from '../utilities/math/math-utilities';
import { Color, ColorCombination } from './color';

export class ColorPalette {
  private readonly basisColors: string[];
  public constructor(basisColors: string[]) {
    if (basisColors.length < 2) {
      throw Error('A color palette must consist of at least 2 colors');
    }
    this.basisColors = basisColors.map(color => rgb(color).toString());
  }

  public getColorCombinations(count: number): ColorCombination[] {
    return this.forNColors(count).map(color => ({ background: color, foreground: this.getContrast(color) }));
  }

  public getColorCombinationForId(id: string, colorSetSize: number = this.basisColors.length): ColorCombination {
    return this.getColorCombinations(colorSetSize)[Math.abs(hashCode(id)) % colorSetSize];
  }

  private getContrast(rgbColorString: string): string {
    // Convert to RGB value
    const rgbColor = rgb(rgbColorString);

    // Get YIQ ratio
    const yiq = (rgbColor.r * 299 + rgbColor.g * 587 + rgbColor.b * 114) / 1000;

    // Check contrast
    return yiq >= 128 ? Color.Gray9 : Color.White;
  }

  public forNColors(count: number): string[] {
    if (count === this.basisColors.length) {
      // Use as is if palette size matches, don't interpolate
      return [...this.basisColors];
    }

    if (count === 1) {
      return [this.basisColors[0]];
    }

    if (count === 2) {
      // Use the start and middle colors for generating 2 colors from a larger palette
      return this.forNColors(3).slice(0, 2);
    }

    // Otherwise, use standard interpolation

    const colorInterpolator = interpolateRgbBasis(this.basisColors);

    return quantize(colorInterpolator, count);
  }

  public forOriginalColors(): string[] {
    return [...this.basisColors];
  }
}
