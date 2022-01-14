import { InjectionToken, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
import { PopoverFixedPositionLocation } from '../../popover/popover';
import { OverlayConfig } from './../overlay';

export interface SheetOverlayConfig<TData = unknown> extends OverlayConfig {
  size: SheetSize;
  data?: TData;
  position?: PopoverFixedPositionLocation.Right | PopoverFixedPositionLocation.RightUnderHeader;
  closeOnEscapeKey?: boolean;
  collapseExpandTrigger?: TemplateRef<unknown>; // To toggle between collapse and expand
  showAnimation?: boolean;
}

export const enum SheetSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  ExtraLarge = 'extra-large',
  ResponsiveExtraLarge = 'responsive-extra-large'
}

export const SHEET_DATA = new InjectionToken<unknown>('SHEET_DATA');

export abstract class SheetRef<TResult = unknown> {
  public abstract readonly closed$: Observable<TResult>;
  public abstract close(result?: TResult): void;
}
