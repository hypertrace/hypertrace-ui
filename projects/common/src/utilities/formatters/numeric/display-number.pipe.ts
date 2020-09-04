import { Pipe, PipeTransform } from '@angular/core';
import { floatFormatter, integerFormatter, NumericFormatter } from './numeric-formatter';

@Pipe({
  name: 'htcDisplayNumber'
})
export class DisplayNumberPipe implements PipeTransform {
  private static readonly INTEGER_FORMATTER: NumericFormatter = integerFormatter;
  private static readonly FLOAT_FORMATTER: NumericFormatter = floatFormatter;

  public transform(value: unknown, style: FormatterStyle = FormatterStyle.Auto): string {
    const valueAsNumber = Number(value);
    if (isNaN(valueAsNumber)) {
      return '-';
    }

    if (style === FormatterStyle.None) {
      return valueAsNumber.toString();
    }

    return this.getFormatter(valueAsNumber, style).format(valueAsNumber);
  }

  private getFormatter(value: number, style: FormatterStyle): NumericFormatter {
    switch (style) {
      case FormatterStyle.Float:
        return DisplayNumberPipe.FLOAT_FORMATTER;
      case FormatterStyle.Integer:
        return DisplayNumberPipe.INTEGER_FORMATTER;
      case FormatterStyle.Auto:
      default:
        return this.isInteger(value) ? DisplayNumberPipe.INTEGER_FORMATTER : DisplayNumberPipe.FLOAT_FORMATTER;
    }
  }

  private isInteger(value: number): boolean {
    return value % 1 === 0;
  }
}

export const enum FormatterStyle {
  Float = 'float',
  Integer = 'int',
  Auto = 'auto',
  None = 'none'
}
