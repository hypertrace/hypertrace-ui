import { HttpParams } from '@angular/common/http';
import { Params } from '@angular/router';

export const getQueryParamStringFromObject = (params: Params): string => {
  let urlParams = new HttpParams();
  Object.entries(params).forEach(([key, value]) => {
    urlParams = urlParams.set(key, value);
  });

  return urlParams.toString();
};
