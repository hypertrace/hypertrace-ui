import { TableColumnWidth } from '../table-api';

export abstract class TableColumnWidthUtil {
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
      return undefined;
    }

    return value;
  }
}
