import { TemplateRef } from '@angular/core';

export interface RadioOption {
  value: string;
  label: string | TemplateRef<unknown>;
  description?: string;
}
