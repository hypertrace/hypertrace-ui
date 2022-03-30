import { InjectionToken, TemplateRef } from '@angular/core';
import { ExternalNavigationParams } from '@hypertrace/common';
import { Observable } from 'rxjs';
import { PopoverFixedPositionLocation } from '../../popover/popover';
import { OverlayConfig } from './../overlay';

export interface SheetOverlayConfig<TData = unknown> extends OverlayConfig {
  size: SheetSize;
  data?: TData;
  position?: PopoverFixedPositionLocation.Right | PopoverFixedPositionLocation.RightUnderHeader;
  closeOnEscapeKey?: boolean;
  closeOnNavigation?: boolean;
  attachedTriggerTemplate?: TemplateRef<unknown>;
  pageNavParams?: ExternalNavigationParams;
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
  public abstract show(): void;
  public abstract hide(): void;
}
