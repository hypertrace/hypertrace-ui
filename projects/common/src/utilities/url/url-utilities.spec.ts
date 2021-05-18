import { Params } from '@angular/router';
import {
  getQueryParamStringFromObject,
  getQueryParamObjectFromString
} from './url-utilities';

describe('getQueryParamStringFromObject', () => {
  it('should return string from a string dictionary', () => {
    const params: Params = {};
    expect(getQueryParamStringFromObject(params)).toBe('');
    params.a = undefined;
    expect(getQueryParamStringFromObject(params)).toBe('');
    params.a = null;
    expect(getQueryParamStringFromObject(params)).toBe(`a=null`);
    params.a = true;
    expect(getQueryParamStringFromObject(params)).toBe(`a=true`);
    params.a = false;
    expect(getQueryParamStringFromObject(params)).toBe(`a=false`);
    params.b = false;
    expect(getQueryParamStringFromObject(params)).toBe(`a=false&b=false`);
    params.a = 'value_1';
    params.b = 'value_2';
    expect(getQueryParamStringFromObject(params)).toBe(`a=value_1&b=value_2`);
  });
});

describe('getQueryParamObjectFromString', () => {
  it('should return object from a string', () => {
    let queryParam = '?queryparam1=value';
    expect(getQueryParamObjectFromString(queryParam)).toHaveProperty('queryparam1');
    expect(getQueryParamObjectFromString(queryParam).queryparam1).toBe('value');
    
    queryParam = '?queryparam1=';
    expect(getQueryParamObjectFromString(queryParam)).toHaveProperty('queryparam1');
    expect(getQueryParamObjectFromString(queryParam).queryparam1).toBe('');

    queryParam = 'queryparam1=value';
    expect(getQueryParamObjectFromString(queryParam)).toHaveProperty('queryparam1');
    expect(getQueryParamObjectFromString(queryParam).queryparam1).toBe('value');

    queryParam = '?queryparam1=value1&queryparam2=value2';
    expect(getQueryParamObjectFromString(queryParam)).toHaveProperty('queryparam1');
    expect(getQueryParamObjectFromString(queryParam).queryparam1).toBe('value1');
    expect(getQueryParamObjectFromString(queryParam)).toHaveProperty('queryparam2');
    expect(getQueryParamObjectFromString(queryParam).queryparam2).toBe('value2');
  });
});