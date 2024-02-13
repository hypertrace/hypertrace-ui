import { CurlCommandGeneratorUtil } from './curl-command-generator-util';

describe('generateCurlCommand', () => {
  test('should generate a curl command for HTTP GET requests', () => {
    const requestUrl = 'https://example.com';
    const protocol = 'HTTP';
    const methodType = 'GET';
    const requestHeaders = {};
    const requestCookies = {};
    const requestBody = '';

    const curlCommand = CurlCommandGeneratorUtil.generateCurlCommand(
      requestHeaders,
      requestCookies,
      requestBody,
      requestUrl,
      protocol,
      methodType,
    );

    expect(curlCommand).toEqual(`curl -X GET https://example.com`);
  });

  test('should generate a curl command for HTTP POST requests with headers and body', () => {
    const requestUrl = 'https://example.com';
    const protocol = 'HTTP';
    const methodType = 'POST';
    const requestHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    const requestCookies = {};
    const requestBody = '{"name": "John", "age": 30}';

    const curlCommand = CurlCommandGeneratorUtil.generateCurlCommand(
      requestHeaders,
      requestCookies,
      requestBody,
      requestUrl,
      protocol,
      methodType,
    );

    expect(curlCommand).toEqual(
      `curl -X POST -H 'Content-Type: application/json' -H 'Accept: application/json' -d '{"name": "John", "age": 30}' https://example.com`,
    );
  });

  test('should generate a curl command for HTTP POST requests with cookies', () => {
    const requestUrl = 'https://example.com';
    const protocol = 'HTTP';
    const methodType = 'POST';
    const requestHeaders = {};
    const requestCookies = {
      sessionid: '123456789',
      user: 'John Doe',
    };
    const requestBody = '{"name": "John", "age": 30}';
    const curlCommand = CurlCommandGeneratorUtil.generateCurlCommand(
      requestHeaders,
      requestCookies,
      requestBody,
      requestUrl,
      protocol,
      methodType,
    );

    expect(curlCommand).toEqual(
      `curl -X POST -b 'sessionid=123456789;user=John Doe' -d '{"name": "John", "age": 30}' https://example.com`,
    );
  });

  test('should generate a curl command for HTTP POST requests with headers, cookies, and body', () => {
    const requestUrl = 'https://example.com';
    const protocol = 'HTTP';
    const methodType = 'POST';
    const requestHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    const requestCookies = {
      sessionid: '123456789',
      user: 'John Doe',
    };
    const requestBody = '{"name": "John", "age": 30}';

    const curlCommand = CurlCommandGeneratorUtil.generateCurlCommand(
      requestHeaders,
      requestCookies,
      requestBody,
      requestUrl,
      protocol,
      methodType,
    );

    expect(curlCommand).toEqual(
      `curl -X POST -H 'Content-Type: application/json' -H 'Accept: application/json' -b 'sessionid=123456789;user=John Doe' -d '{"name": "John", "age": 30}' https://example.com`,
    );
  });

  test('should return an error message for unsupported protocols', () => {
    const requestUrl = 'https://example.com';
    const protocol = 'ftp';
    const methodType = 'POST';
    const requestHeaders = {};
    const requestCookies = {};
    const requestBody = '';

    const curlCommand = CurlCommandGeneratorUtil.generateCurlCommand(
      requestHeaders,
      requestCookies,
      requestBody,
      requestUrl,
      protocol,
      methodType,
    );

    expect(curlCommand).toEqual('curl command is not supported');
  });
});
