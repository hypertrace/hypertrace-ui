import { InjectionToken, TemplateRef, Type } from '@angular/core';
import { Observable } from 'rxjs';

export interface ModalConfig<TData = unknown> {
  size: ModalSize;
  content: TemplateRef<unknown> | Type<unknown>;
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

export const MODAL_DATA = new InjectionToken<unknown>('MODAL_DATA');

export abstract class ModalRef<TResult> {
  public abstract readonly closed$: Observable<TResult>;
  public abstract close(result?: TResult): void;
}
