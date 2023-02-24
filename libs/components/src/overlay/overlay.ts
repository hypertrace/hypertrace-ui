import { TemplateRef, Type } from '@angular/core';

export interface OverlayConfig {
  showHeader?: boolean;
  title?: string | TemplateRef<unknown>;
  content: TemplateRef<unknown> | Type<unknown>;
}
