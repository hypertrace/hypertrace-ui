import { InjectionToken } from '@angular/core';

export const externalUrlDomainAllowList: string[] = ['hypertrace.org'];
export const EXTERNAL_URL_DOMAIN_ALLOWLIST = new InjectionToken<string[]>('EXTERNAL_URL_DOMAIN_ALLOWLIST');
