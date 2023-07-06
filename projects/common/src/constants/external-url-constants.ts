import { InjectionToken } from '@angular/core';

export const externalUrlConstants: ExternalUrlConstants = {
  urlAllowList: [],
  domainAllowList: ['hypertrace.org']
};

export interface ExternalUrlConstants {
  urlAllowList: string[];
  domainAllowList: string[];
}

export const EXTERNAL_URL_CONSTANTS = new InjectionToken<ExternalUrlConstants>('EXTERNAL_URL_CONSTANTS');
