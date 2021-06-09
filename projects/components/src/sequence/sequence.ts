import { Point } from '@hypertrace/common';
import { Selection } from 'd3-selection';
import { SequenceObject } from './sequence-object';

export interface SequenceSegment {
  id: string;
  start: number;
  end: number;
  color: string;
  markers: Marker[];
}

export interface Marker {
  id: string;
  markerTime: number;
  timestamps: string[];
}

export interface MarkerDatum {
  marker: Marker;
  origin: Point;
}

/* Internal Types */
export interface SequenceOptions {
  data: SequenceSegment[];
  selected?: SequenceSegment;
  hovered?: SequenceSegment;
  margin: MarginOptions;
  headerHeight: number;
  rowHeight: number;
  barHeight: number;
  unit: string | undefined;
  onSegmentSelected(row?: SequenceSegment): void;
  onSegmentHovered(row?: SequenceSegment): void;
  onMarkerHovered(datum?: MarkerDatum): void;
}

export interface MarginOptions {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export type SequenceContainerSelection = Selection<HTMLElement, SequenceObject, null, undefined>;
export type SequenceSVGSelection = Selection<SVGElement, SequenceObject, null, undefined>;

export const enum SequenceLayoutStyleClass {
  Plot = 'plot-section',
  Axis = 'axis-section'
}
