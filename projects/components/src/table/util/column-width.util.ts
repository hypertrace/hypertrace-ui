import { TableColumnWidth } from '../table-api';

export abstract class TableColumnWidthUtil {
  public static isWidthCompatible(width?: TableColumnWidth): boolean {
    if (this.isNumberOrUndefined(width)) {
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
    if (this.isNumberOrUndefined(value)) {
      return undefined;
    }

    return value;
  }

  public static getMinWidth(value?: TableColumnWidth): string {
    if (this.isNumberOrUndefined(value)) {
      return '0px';
    }

    return value;
  }

  public static getFlexGrow(value?: TableColumnWidth): number | undefined {
    if (this.isNumberOrUndefined(value)) {
      return value ?? 1;
    }

    return undefined;
  }

  public static getFlexBasis(value?: TableColumnWidth): string | undefined {
    if (this.isNumberOrUndefined(value)) {
      return '0px';
    }

    return value;
  }

  public static isPxWidthColumn(width?: TableColumnWidth): boolean {
    if (typeof width === 'string') {
      let value = Number(width.substring(0, width.length - 2));
      let unit = width.substring(width.length - 2);

      if (!Number.isNaN(value) && unit === 'px') {
        return true;
      }

      return false;
    }

    return false;
  }

  public static getColWidthInPx(width?: TableColumnWidth): number {
    return typeof width === 'string' && this.isPxWidthColumn(width) ? Number(width.substring(0, width.length - 2)) : 0;
  }

  private static isNumberOrUndefined(value?: TableColumnWidth): value is number | undefined {
    return value === undefined || typeof value === 'number';
  }
}
