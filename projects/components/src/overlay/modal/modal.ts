import { InjectionToken, Injector, TemplateRef, Type } from '@angular/core';
import { PopoverBackdrop } from '../../popover/popover';
import { OverlayConfig } from './../overlay';

export interface ModalOverlayConfig<TData> extends OverlayConfig {
  size: ModalSize;
  data?: TData;
}

export const enum ModalSize {
  Small = 'small'
}

export const MODAL_DATA = new InjectionToken<unknown>('MODAL_DATA');

export interface ModalOptions<TData = never> {
  componentOrTemplate: Type<unknown> | TemplateRef<TData>;
  data?: TData;
  parentInjector?: Injector;
  backdrop?: PopoverBackdrop;
}
