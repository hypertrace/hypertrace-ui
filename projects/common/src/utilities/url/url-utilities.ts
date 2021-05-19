import { HttpParams } from '@angular/common/http';
import { Params } from '@angular/router';

export const getQueryParamStringFromObject = (params: Params): string =>
  new HttpParams({ fromObject: params }).toString();
