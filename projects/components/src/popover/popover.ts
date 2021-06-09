import { ElementRef, InjectionToken, Injector, TemplateRef, Type } from '@angular/core';

export interface PopoverOptions<TData = never> {
  componentOrTemplate: Type<unknown> | TemplateRef<TData>;
  data?: TData;
  position: PopoverPosition;
  parentInjector?: Injector;
  backdrop?: PopoverBackdrop;
}

export const enum PopoverBackdrop {
  Transparent = 'transparent',
  Opaque = 'opaque',
  None = 'none'
}

export interface PopoverMousePosition {
  type: PopoverPositionType.FollowMouse;
  boundingElement: Element;
  offsetX?: number;
  offsetY?: number;
}

export interface PopoverHiddenPosition {
  type: PopoverPositionType.Hidden;
}

export interface PopoverRelativePosition {
  type: PopoverPositionType.Relative;
  origin: ElementRef;
  locationPreferences: PopoverRelativePositionLocation[];
}

export interface PopoverFixedPosition {
  type: PopoverPositionType.Fixed;
  location: PopoverFixedPositionLocation;
}

export type PopoverPosition =
  | PopoverMousePosition
  | PopoverHiddenPosition
  | PopoverRelativePosition
  | PopoverFixedPosition;

export const enum PopoverPositionType {
  Relative,
  FollowMouse,
  Hidden,
  Fixed
}

export const enum PopoverRelativePositionLocation {
  BelowCentered,
  BelowRightAligned,
  BelowLeftAligned,
  AboveCentered,
  AboveRightAligned,
  AboveLeftAligned,
  LeftCentered,
  OverLeftAligned,
  RightCentered,
  InsideTopLeft
}

export const enum PopoverFixedPositionLocation {
  RightUnderHeader,
  Centered,
  Right
}

export const POPOVER_DATA = new InjectionToken<unknown>('POPOVER_DATA');
