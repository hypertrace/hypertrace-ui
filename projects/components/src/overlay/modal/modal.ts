import { OverlayConfig } from './../overlay';

export interface ModalOverlayConfig<TData> extends OverlayConfig {
  size: ModalSize;
  data?: TData;
}

export const enum ModalSize {
  Small = 'small'
}
