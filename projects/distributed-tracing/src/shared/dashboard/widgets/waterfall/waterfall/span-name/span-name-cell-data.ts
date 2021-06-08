export interface SpanNameCellData {
  serviceName: string;
  protocolName?: string;
  apiName?: string;
  color?: string;
  hasError?: boolean;
  hasLogs?: boolean;
}
