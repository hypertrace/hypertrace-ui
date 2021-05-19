import { Params } from '@angular/router';
import { getQueryParamStringFromObject } from './url-utilities';

describe('getQueryParamStringFromObject', () => {
  test('should return string from a string dictionary', () => {
    const params: Params = {};
    expect(getQueryParamStringFromObject(params)).toBe('');
    params.a = 'value_1';
    expect(getQueryParamStringFromObject(params)).toBe('a=value_1');
    params.b = 'value_2';
    expect(getQueryParamStringFromObject(params)).toBe(`a=value_1&b=value_2`);
  });
});
