import { Injectable, Injector } from '@angular/core';
import { SvgUtilService } from '../utils/svg/svg-util.service';
import { CartesianChart, RenderingStrategy } from './chart';
import { DefaultCartesianChart } from './d3/chart/cartesian-chart';

@Injectable({ providedIn: 'root' })
export class ChartBuilderService {
  public constructor(private readonly injector: Injector, private readonly svgUtilService: SvgUtilService) {}
  public build<TData>(strategy: RenderingStrategy, element: Element): CartesianChart<TData> {
    return new DefaultCartesianChart(element, this.injector, strategy, this.svgUtilService);
  }
}
