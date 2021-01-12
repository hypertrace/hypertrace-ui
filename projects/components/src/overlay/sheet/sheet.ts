import { InjectionToken } from '@angular/core';
import { OverlayConfig } from './../overlay';

export interface SheetOverlayConfig<TData = unknown> extends OverlayConfig {
  size: SheetSize;
  data?: TData;
}

export const enum SheetSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  ExtraLarge = 'extra-large',
  ResponsiveExtraLarge = 'responsive-extra-large'
}

export const SHEET_DATA = new InjectionToken<unknown>('SHEET_DATA');
