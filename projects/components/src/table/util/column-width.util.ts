import { TableColumnWidth } from '../table-api';

export abstract class TableColumnWidthUtil {
  public static isWidthCompatible(width?: TableColumnWidth): boolean {
    if (width === undefined || typeof width === 'number') {
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
    if (value === undefined || typeof value === 'number') {
      return undefined;
    }

    return value;
  }

  public static getMinWidth(value?: TableColumnWidth): string {
    if (value === undefined || typeof value === 'number') {
      return '0px';
    }

    return value;
  }

  public static getFlexGrow(value?: TableColumnWidth): number | undefined {
    if (value === undefined || typeof value === 'number') {
      return value ?? 1;
    }

    return undefined;
  }

  public static getFlexBasis(value?: TableColumnWidth): string | undefined {
    if (value === undefined || typeof value === 'number') {
      return '0px';
    }

    return value;
  }
}
