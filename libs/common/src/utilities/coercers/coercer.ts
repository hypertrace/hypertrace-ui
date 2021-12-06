export abstract class Coercer<T, TOptions extends CoercerOptions<T>> {
  protected readonly options: Readonly<TOptions>;

  public constructor(options: TOptions) {
    this.options = this.assignDefaults(options);
  }

  protected abstract tryCoerceSingleValue(value: unknown): T | undefined;

  public coerce(value: unknown): T | undefined {
    const collectedValues = this.collectValuesToCheck(value);

    for (const collectedValue of collectedValues) {
      const coercedValue = this.tryCoerceSingleValue(collectedValue);
      if (coercedValue !== undefined) {
        return coercedValue;
      }
    }

    return this.options.defaultValue;
  }

  protected assignDefaults(options: TOptions): TOptions {
    return {
      useSelf: true,
      ...options
    };
  }

  public canCoerce(value: unknown): boolean {
    return this.coerce(value) !== undefined;
  }

  protected collectValuesToCheck(value: unknown): unknown[] {
    return [
      // tslint:disable-next-line: strict-boolean-expressions
      this.options.useSelf ? value : undefined,
      ...this.extractObjectKeys(value),
      ...this.extractArrayIndices(value)
    ];
  }

  protected extractObjectKeys(value: unknown): unknown[] {
    if (!Array.isArray(this.options.extractObjectKeys) || this.options.extractObjectKeys.length === 0) {
      return [];
    }
    if (typeof value !== 'object' || value === null) {
      return [];
    }

    return this.options.extractObjectKeys.map(key => (value as { [key: string]: unknown })[key]);
  }

  protected extractArrayIndices(value: unknown): unknown[] {
    if (!Array.isArray(this.options.extractArrayIndices) || this.options.extractArrayIndices.length === 0) {
      return [];
    }

    if (!Array.isArray(value)) {
      return [];
    }

    if (this.options.maxArrayLength !== undefined && this.options.maxArrayLength < value.length) {
      return [];
    }

    return this.options.extractArrayIndices.map(index => value[index]);
  }
}

export interface CoercerOptions<T> {
  defaultValue?: T;
  extractObjectKeys?: string[];
  extractArrayIndices?: number[];
  maxArrayLength?: number;
  useSelf?: boolean;
}
