import { Injectable, Injector, Renderer2 } from '@angular/core';
import { D3UtilService } from '../utils/d3/d3-util.service';
import { SvgUtilService } from '../utils/svg/svg-util.service';
import { CartesianChart, RenderingStrategy } from './chart';
import { DefaultCartesianChart } from './d3/chart/cartesian-chart';

@Injectable({ providedIn: 'root' })
export class ChartBuilderService {
  public constructor(
    private readonly injector: Injector,
    private readonly svgUtilService: SvgUtilService,
    protected readonly d3Utils: D3UtilService,
    protected readonly domRenderer: Renderer2
  ) {}

  public build<TData>(strategy: RenderingStrategy, element: Element): CartesianChart<TData> {
    return new DefaultCartesianChart(
      element,
      this.injector,
      strategy,
      this.svgUtilService,
      this.d3Utils,
      this.domRenderer
    );
  }
}
