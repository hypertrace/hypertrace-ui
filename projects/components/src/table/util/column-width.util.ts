import { isNumber } from 'lodash-es';
import { TableColumnWidth } from '../table-api';

export abstract class TableColumnWidthUtil {
  public static isWidthCompatible(width?: TableColumnWidth): boolean {
    if (width === undefined || isNumber(Number(width))) {
      return true;
    }

    // Pixel value check
    let value = Number(width.substring(0, width.length - 2));
    let unit = width.substring(width.length - 2);

    if (!Number.isNaN(value) && unit === 'px') {
      return true;
    }

    // Percent value check
    value = Number(width.substring(0, width.length - 1));
    unit = width.substring(width.length - 1);

    if (!Number.isNaN(value) && unit === '%') {
      return true;
    }

    return false;
  }

  public static getWidth(value?: TableColumnWidth): string | undefined {
    if (value === undefined || isNumber(Number(value))) {
      return undefined;
    }

    return value;
  }

  public static getMinWidth(value?: TableColumnWidth): string {
    if (value === undefined || isNumber(Number(value))) {
      return '0px';
    }

    return value;
  }

  public static getFlexGrow(value?: TableColumnWidth): number | undefined {
    if (value === undefined) {
      return 1;
    }

    if (isNumber(Number(value))) {
      return Number(value);
    }

    return undefined;
  }

  public static getFlexBasis(value?: TableColumnWidth): string | undefined {
    if (value === undefined || isNumber(Number(value))) {
      return undefined;
    }

    return value;
  }
}
