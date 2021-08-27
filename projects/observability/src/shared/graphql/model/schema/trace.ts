import { Span } from './span';

// Use symbols so we can decorate this info without worrying about existing fields
export const traceIdKey = Symbol('traceId');
export const traceTypeKey = Symbol('traceType');

export interface Trace {
  [key: string]: unknown;
  [traceIdKey]: string;
  [traceTypeKey]: TraceType;
  spans?: Span[];
}

// TODO remove TraceType entirely once removed from graphql API
export type TraceType = string;
export const TRACE_SCOPE = 'TRACE';
// Allow transitioning off trace type by making it optional. Remove once trace type removed.
export const resolveTraceType = (type: TraceType = TRACE_SCOPE): TraceType => type;

export interface TraceStatus {
  status: TraceStatusType;
  statusCode: string;
  statusMessage: string;
}

export const enum TraceStatusType {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL'
}
