import { TemplateRef, Type } from '@angular/core';
import { Observable } from 'rxjs';

export interface OverlayConfig {
  showHeader?: boolean;
  title?: string;
  content: TemplateRef<unknown> | Type<unknown>;
}

export interface ConfirmationModalConfig extends OverlayConfig {
  confirmation$: Observable<boolean>;
}
