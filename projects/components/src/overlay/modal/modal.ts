import { OverlayConfig } from './../overlay';

export interface ModalOverlayConfig extends OverlayConfig {
  size: ModalSize;
}

export const enum ModalSize {
  Small = 'small'
}
