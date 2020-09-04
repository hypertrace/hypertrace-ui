import { Coercer, CoercerOptions } from './coercer';

export class NumberCoercer extends Coercer<number, CoercerOptions<number>> {
  public constructor(options: CoercerOptions<number> = {}) {
    super(options);
  }

  protected tryCoerceSingleValue(value: unknown): number | undefined {
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }

    if (typeof value === 'object' && value !== null) {
      const valueOfValue: unknown = value.valueOf();
      if (typeof valueOfValue !== 'object') {
        // Don't allow recursing more than once
        return this.tryCoerceSingleValue(valueOfValue);
      }
    }

    if (typeof value === 'string') {
      const asNumber = Number(value);
      if (!isNaN(asNumber)) {
        return asNumber;
      }
    }

    return undefined;
  }
}
