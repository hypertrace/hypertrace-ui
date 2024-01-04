import { Dictionary } from '@hypertrace/common';

export abstract class CurlCommandGeneratorUtil {
  private static readonly CURL_COMMAND_NAME: string = 'curl';
  private static readonly HEADER_OPTION: string = '-H';
  private static readonly REQUEST_OPTION: string = '-X';
  private static readonly BODY_OPTION: string = '-d';
  private static readonly COOKIES_OPTION: string = '-b';
  private static readonly SINGLE_SPACE: string = ' ';
  private static readonly SINGLE_QUOTES_DELIMITER_CHAR: string = "\\'";
  private static readonly SINGLE_QUOTE_CHAR: string = "'";
  private static readonly SEMI_COLON_CHAR: string = ';';
  private static readonly COLON_CHAR: string = ':';
  private static readonly EQUALS_CHAR: string = '=';
  private static readonly GET_METHOD: string = 'GET';
  private static readonly DELETE_METHOD: string = 'DELETE';
  private static readonly NOT_SUPPORTED_MESSAGE: string = 'curl command is not supported';

  public static generateCurlCommand(
    requestHeaders: Dictionary<unknown>,
    requestCookies: Dictionary<unknown>,
    requestBody: string,
    requestUrl: string,
    protocol: string,
    methodType: string,
  ): string {
    let curlCommand: string = '';

    if (protocol === Protocol.PROTOCOL_HTTP || protocol === Protocol.PROTOCOL_HTTPS) {
      curlCommand += `${this.CURL_COMMAND_NAME}${this.SINGLE_SPACE}${this.REQUEST_OPTION}${this.SINGLE_SPACE}${methodType}${this.SINGLE_SPACE}`;

      if (Object.entries(requestHeaders).length > 0) {
        curlCommand += `${this.getHeadersAsString(requestHeaders)}`;
      }

      if (Object.entries(requestCookies).length > 0) {
        curlCommand += `${this.getCookiesAsString(requestCookies)}`;
      }

      // { POST, PUT, PATCH } methodType will have a body, and { GET, DELETE } will not.
      if (!(methodType.includes(this.GET_METHOD) || methodType.includes(this.DELETE_METHOD))) {
        curlCommand += `${this.BODY_OPTION}${this.SINGLE_SPACE}${this.SINGLE_QUOTE_CHAR}${this.getEnrichedBody(
          requestBody,
        )}${this.SINGLE_QUOTE_CHAR}${this.SINGLE_SPACE}`;
      }

      curlCommand += requestUrl;
    } else {
      curlCommand += this.NOT_SUPPORTED_MESSAGE;
    }

    console.log(curlCommand);

    return curlCommand;
  }

  private static getHeadersAsString(requestHeaders: Dictionary<unknown>): string {
    return Object.entries(requestHeaders)
      .map(
        ([key, value]) =>
          `${this.HEADER_OPTION}${this.SINGLE_SPACE}${this.SINGLE_QUOTE_CHAR}${key}${this.COLON_CHAR}${this.SINGLE_SPACE}${value}${this.SINGLE_QUOTE_CHAR}${this.SINGLE_SPACE}`,
      )
      .join('');
  }

  private static getCookiesAsString(requestCookies: Dictionary<unknown>): string {
    let cookiesString: string = '';

    cookiesString += `${this.COOKIES_OPTION}${this.SINGLE_SPACE}${this.SINGLE_QUOTE_CHAR}`;

    Object.entries(requestCookies).forEach(([key, value]) => {
      cookiesString += `${key}${this.EQUALS_CHAR}${value}${this.SEMI_COLON_CHAR}`;
    });

    if (cookiesString[cookiesString.length - 1] === this.SEMI_COLON_CHAR) {
      cookiesString = cookiesString.substr(0, cookiesString.length - 1);
    }

    cookiesString += `${this.SINGLE_QUOTE_CHAR}${this.SINGLE_SPACE}`;

    return cookiesString;
  }

  private static getEnrichedBody(body: string): string {
    return body.replaceAll(this.SINGLE_QUOTE_CHAR, this.SINGLE_QUOTES_DELIMITER_CHAR);
  }
}

const enum Protocol {
  PROTOCOL_HTTP = 'HTTP',
  PROTOCOL_HTTPS = 'HTTPS',
}
