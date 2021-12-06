import { Coercer, CoercerOptions } from './coercer';

export class BooleanCoercer extends Coercer<boolean, CoercerOptions<boolean>> {
  public constructor(options: CoercerOptions<boolean> = {}) {
    super(options);
  }

  protected tryCoerceSingleValue(value: unknown): boolean {
    // Generally, rely on the truthiness of the value except for the string 'false' (or a variation thereof)
    if (typeof value === 'string' && value.toLowerCase() === 'false') {
      return false;
    }

    return Boolean(value);
  }
}
