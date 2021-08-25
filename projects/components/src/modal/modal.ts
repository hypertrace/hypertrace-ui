import { InjectionToken, TemplateRef, Type } from '@angular/core';
import { Observable } from 'rxjs';

export interface ModalConfig<TData = unknown> {
  content: TemplateRef<unknown> | Type<unknown>;
  size: ModalSize | ModalDimension;
  showControls?: boolean;
  title?: string;
  data?: TData;
  closeOnEscapeKey?: boolean;
}

export const enum ModalSize {
  Small = 'small',
  Medium = 'medium',
  LargeShort = 'large-short',
  Large = 'large',
  LargeTall = 'large-tall',
  MediumWide = 'medium-wide'
}

export interface ModalDimension {
  // Number => without unit (considered px) and String => with units (expression included)
  height: number | string;
  width: number | string;
}

export const getModalDimensions = (modalSize?: ModalSize): ModalDimension => {
  switch (modalSize) {
    case ModalSize.Small:
      return {
        height: 365,
        width: 420
      };
    case ModalSize.Medium:
      return {
        height: 530,
        width: 456
      };
    case ModalSize.LargeShort:
      return {
        height: 540,
        width: 640
      };
    case ModalSize.Large:
      return {
        height: 720,
        width: 640
      };
    case ModalSize.LargeTall:
      return {
        height: 800,
        width: 640
      };
    case ModalSize.MediumWide:
      return {
        height: 600,
        width: 840
      };
    default:
      return {
        height: 365,
        width: 420
      };
  }
};
export const MODAL_DATA = new InjectionToken<unknown>('MODAL_DATA');

export abstract class ModalRef<TResult> {
  public abstract readonly closed$: Observable<TResult>;
  public abstract close(result?: TResult): void;
}
