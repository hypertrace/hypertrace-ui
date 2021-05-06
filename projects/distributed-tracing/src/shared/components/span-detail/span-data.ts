import { Dictionary } from '@hypertrace/common';
import { LogEvent } from '../../dashboard/widgets/waterfall/waterfall/waterfall-chart';

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
  startTime: number;
  logEvents?: LogEvent[];
}
