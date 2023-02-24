import { cloneDeep, defaults } from 'lodash-es';

export class NumericFormatter {
  public static readonly STANDARD_VALUES: ReadonlyArray<NumericFormatterThreshold> = [
    { minimumValue: 1000, suffix: 'K', unitValue: 1000 },
    { minimumValue: 1000000, suffix: 'M', unitValue: 1000000 },
    { minimumValue: 1000000000, suffix: 'B', unitValue: 1000000000 },
    { minimumValue: 1000000000000, suffix: 'T', unitValue: 1000000000000 }
  ];

  private static readonly DEFAULT_THRESHOLD: NumericFormatterThreshold = {
    minimumValue: -Infinity,
    suffix: '',
    unitValue: 1
  };

  private static readonly DEFAULT_OPTIONS: Readonly<Required<NumericFormatterOptions>> = {
    trailingUnscaledDigits: 1,
    trailingScaledDigits: 1,
    trimTrailingZeros: true,
    thresholds: [...NumericFormatter.STANDARD_VALUES]
  };

  protected readonly options: Readonly<Required<NumericFormatterOptions>>;

  public constructor(options: NumericFormatterOptions = {}) {
    this.options = this.applyOptionDefaults(options);
  }

  public format(value: number): string {
    const threshold = this.findAppropriateThreshold(value);

    return this.convertNumberToString(value, threshold);
  }

  protected applyOptionDefaults(options: NumericFormatterOptions): Readonly<Required<NumericFormatterOptions>> {
    const newOptions = defaults(cloneDeep(options), NumericFormatter.DEFAULT_OPTIONS);
    // Always sort thresholds by minimum value so we can more quickly search for appropriate threshold
    newOptions.thresholds.sort((threshold1, threshold2) => threshold1.minimumValue - threshold2.minimumValue);

    return newOptions;
  }

  protected findAppropriateThreshold(value: number): NumericFormatterThreshold {
    const indexOfLargerThreshold = this.options.thresholds.findIndex(threshold => threshold.minimumValue > value);
    if (indexOfLargerThreshold === -1) {
      // No larger found, use largest threshold
      return this.options.thresholds[this.options.thresholds.length - 1];
    }
    if (indexOfLargerThreshold === 0) {
      // Smaller than smallest, use default
      return NumericFormatter.DEFAULT_THRESHOLD;
    }

    return this.options.thresholds[indexOfLargerThreshold - 1];
  }

  protected convertToScaledNumberForThreshold(value: number, threshold: NumericFormatterThreshold): number {
    return value / threshold.unitValue;
  }

  protected convertNumberToString(value: number, threshold: NumericFormatterThreshold): string {
    const digitsToUse = this.getNumberOfDigitsForThreshold(threshold);
    const scaledValue = this.convertToScaledNumberForThreshold(value, threshold);
    const roundedValue = this.roundToDecimalPlaces(scaledValue, digitsToUse);
    const valueAsString = this.options.trimTrailingZeros ? `${roundedValue}` : roundedValue.toFixed(digitsToUse);

    return `${valueAsString}${threshold.suffix}`;
  }

  protected getNumberOfDigitsForThreshold(threshold: NumericFormatterThreshold): number {
    if (threshold.unitValue === 1) {
      return this.options.trailingUnscaledDigits;
    }

    return this.options.trailingScaledDigits;
  }

  protected roundToDecimalPlaces(value: number, decimalPlaces: number): number {
    const exponentialNotation = Number(`${value}e${decimalPlaces}`);
    const multipliedValue = isNaN(exponentialNotation) ? value * Math.pow(10, decimalPlaces) : exponentialNotation;

    return Number(`${Math.round(multipliedValue)}e-${decimalPlaces}`);
  }
}

export const integerFormatter = new NumericFormatter({
  trailingScaledDigits: 2,
  trailingUnscaledDigits: 0,
  trimTrailingZeros: false
});
export const floatFormatter = new NumericFormatter({
  trailingScaledDigits: 2,
  trailingUnscaledDigits: 2,
  trimTrailingZeros: false
});

interface NumericFormatterOptions {
  trailingUnscaledDigits?: number;
  trailingScaledDigits?: number;
  trimTrailingZeros?: boolean;
  thresholds?: NumericFormatterThreshold[];
}

interface NumericFormatterThreshold {
  minimumValue: number;
  suffix: string;
  unitValue: number;
}
