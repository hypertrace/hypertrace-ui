import { Dictionary, isEmpty } from "lodash"

export const getQueryParamStringFromObject = (params: Dictionary<string | number>): string => {
	try {
		const paramString: string = Object.entries(params)
			.map(([key, value]) => value !== undefined ? `${key}=${value}` : '')
			.filter(item => item)
			.join('&');
		return isEmpty(paramString) ? '' : paramString;
	} catch (error) {
		return ``;
	}
};

export const getQueryParamObjectFromString = (string: string): Dictionary<string> => {
	try {
		string = string[0] === '?' ? string.substring(1) : string;
		return string.split('&').reduce((acc: Dictionary<string>, item: string): Dictionary<string> => {
			const [key, value] = item.split('=');
			acc[key] = value;
			return acc;
		}, {});
	} catch (error) {
		return {};
	}
};