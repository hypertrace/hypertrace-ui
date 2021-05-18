import { Dictionary, isEmpty } from 'lodash';

export const getQueryParamStringFromObject = (params: Dictionary<string | number>): string => {
  try {
    const paramString: string = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .filter(item => item)
      .join('&');

    return isEmpty(paramString) ? '' : paramString;
  } catch (error) {
    return ``;
  }
};

export const getQueryParamObjectFromString = (query: string): Dictionary<string> => {
  try {
    const queryString = query[0] === '?' ? query.substring(1) : query;

    return queryString.split('&').reduce((acc: Dictionary<string>, item: string): Dictionary<string> => {
      const [key, value] = item.split('=');
      acc[key] = value;

      return acc;
    }, {});
  } catch (error) {
    return {};
  }
};
