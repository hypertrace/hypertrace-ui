import { Dictionary } from '@hypertrace/common';

export interface SpanData {
  id: string;
  serviceName?: string;
  apiName?: string;
  protocolName?: string;
  requestHeaders: Dictionary<unknown>;
  requestBody: string;
  responseHeaders: Dictionary<unknown>;
  responseBody: string;
  tags: Dictionary<unknown>;
  requestUrl: string;
  exitCallsBreakup?: Dictionary<string>;
}
