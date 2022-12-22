import { InjectionToken, TemplateRef, Type } from '@angular/core';
import { Color } from '@hypertrace/common';
import { Observable } from 'rxjs';

export interface ModalConfig<TData = unknown> {
  content: TemplateRef<unknown> | Type<unknown>;
  size: ModalSize | ModalDimension;
  showControls?: boolean;
  title?: string;
  data?: TData;
  closeOnEscapeKey?: boolean;
  styles?: ModalStyles;
}

// TODO: Revisit this
export interface ModalStyles {
  'background-color'?: Color;
}

export const enum ModalSize {
  Small = 'small',
  Medium = 'medium',
  LargeShort = 'large-short',
  Large = 'large',
  LargeTall = 'large-tall',
  MediumWide = 'medium-wide',
  LargeWide = 'large-wide'
}

export interface ModalDimension {
  // Number => without unit (considered px) and String => with units (expression included)
  width: number | string;
  height: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
}

export const getModalDimensions = (modalSize: ModalSize): ModalDimension => {
  switch (modalSize) {
    case ModalSize.Small:
      return getModalDimensionObject(420, 365);
    case ModalSize.Medium:
      return getModalDimensionObject(456, 530);
    case ModalSize.LargeShort:
      return getModalDimensionObject(640, 540);
    case ModalSize.Large:
      return getModalDimensionObject(640, 720);
    case ModalSize.LargeTall:
      return getModalDimensionObject(840, '90vh');
    case ModalSize.MediumWide:
      return getModalDimensionObject(840, 600);
    case ModalSize.LargeWide:
      return getModalDimensionObject('95em', '90vh');
    default:
      return getModalDimensionObject(420, 365);
  }
};

const getModalDimensionObject = (width: number | string, height: number | string): ModalDimension => ({
  width: width,
  height: height
});

export const MODAL_DATA = new InjectionToken<unknown>('MODAL_DATA');

export abstract class ModalRef<TResult> {
  public abstract readonly closed$: Observable<TResult>;

  public abstract close(result?: TResult): void;
}
