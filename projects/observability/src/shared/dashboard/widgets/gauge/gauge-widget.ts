import { GaugeThreshold } from '../../../components/gauge/gauge.component';

export interface GaugeWidgetData {
  value: number;
  maxValue: number;
  thresholds: GaugeThreshold[];
}
