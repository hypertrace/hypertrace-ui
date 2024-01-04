import { Coercer, CoercerOptions } from './coercer';

export class NoopCoercer<T> extends Coercer<T, CoercerOptions<T>> {
  public constructor(options: CoercerOptions<T> = {}) {
    super(options);
  }

  protected tryCoerceSingleValue(value: unknown): T | undefined {
    return value as T;
  }
}
