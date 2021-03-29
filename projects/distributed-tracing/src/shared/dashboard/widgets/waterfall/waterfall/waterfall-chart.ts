import { Dictionary } from '@hypertrace/common';
import { StatefulPrefetchedTreeTableRow } from '@hypertrace/components';
import { SpanType } from '../../../../graphql/model/schema/span';
import { SpanNameCellData } from './span-name/span-name-cell-data';

export interface WaterfallData {
  id: string;
  isCurrentExecutionEntrySpan: boolean;
  parentId: string;
  startTime: number;
  endTime: number;
  duration: {
    value: number;
    units?: string;
  };
  name: string;
  serviceName: string;
  protocolName: string;
  spanType: SpanType;
  requestHeaders?: Dictionary<unknown>;
  requestBody?: string;
  responseHeaders?: Dictionary<unknown>;
  responseBody?: string;
  tags: Dictionary<unknown>;
}

export interface WaterfallDataNode extends WaterfallData, Omit<StatefulPrefetchedTreeTableRow, '$$state'> {
  $$state: WaterfallChartState;
  $$spanName: SpanNameCellData;
  $$iconType: string;
  color?: string;
}

export interface WaterfallChartState {
  parent?: WaterfallDataNode;
  children: WaterfallDataNode[];
  expanded: boolean;
}
