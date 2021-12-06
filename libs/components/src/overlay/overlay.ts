import { TemplateRef, Type } from '@angular/core';

export interface OverlayConfig {
  showHeader?: boolean;
  title?: string;
  content: TemplateRef<unknown> | Type<unknown>;
}
