import { Axis as D3Axis, axisBottom, AxisDomain, axisLeft, axisRight, AxisScale, axisTop } from 'd3-axis';
import { BaseType, select, Selection } from 'd3-selection';
import { defaultsDeep } from 'lodash-es';
import { MouseLocationData } from '../../../utils/mouse-tracking/mouse-tracking';
import { SvgUtilService } from '../../../utils/svg/svg-util.service';
import { Axis, AxisLocation, AxisType } from '../../chart';
import { CartesianNoDataMessage } from '../cartesian-no-data-message';
import { ScaleInitializationData } from '../scale/cartesian-scale';
import { AnyCartesianScale, CartesianScaleBuilder } from '../scale/cartesian-scale-builder';
import { CartesianAxisCrosshair } from './cartesian-axis-crosshair';

export class CartesianAxis<TData = {}> {
  private static readonly CSS_CLASS: string = 'axis';
  public static readonly CSS_SELECTOR: string = `.${CartesianAxis.CSS_CLASS}`;

  protected readonly configuration: DefaultedAxisConfig;
  protected readonly crosshair?: CartesianAxisCrosshair;
  protected readonly scale!: AnyCartesianScale<TData>;

  protected axisElement?: SVGGElement;

  public constructor(
    configuration: Axis,
    protected readonly scaleBuilder: CartesianScaleBuilder<TData>,
    protected readonly svgUtilService: SvgUtilService
  ) {
    this.scale = this.scaleBuilder.withAxis(configuration).build(configuration.type);
    this.configuration = this.applyDefaults(configuration);

    this.crosshair =
      this.configuration.crosshair &&
      new CartesianAxisCrosshair(this.configuration.type, this.configuration.crosshair, this.scale.initData.bounds);
  }

  public draw(element: BaseType): this {
    const axis = this.getAxisConstructor()(this.scale.d3Implementation as AxisScale<AxisDomain>);

    this.addTicksToAxis(axis);

    const axisSvgSelection = select(element)
      .append('g')
      .classed(CartesianAxis.CSS_CLASS, true)
      .classed(CartesianNoDataMessage.NO_DATA_HIDABLE_CSS_CLASS, this.configuration.type === AxisType.Y)
      .call(axis);

    this.axisElement = axisSvgSelection
      .call(axisGroup => this.customizeAxis(axisGroup))
      .attr('transform', this.getAxisTransform())
      .node()!;

    this.maybeTruncateAxisTicks(axisSvgSelection);
    this.addGridLinesIfNeeded();

    return this;
  }

  public onMouseMove(locationData: MouseLocationData<TData, unknown>[]): void {
    this.crosshair && this.axisElement && this.crosshair.draw(this.axisElement, locationData);
  }

  public onMouseLeave(): void {
    this.crosshair && this.axisElement && this.crosshair.hide(this.axisElement);
  }

  protected addTicksToAxis(axis: D3Axis<AxisDomain>): void {
    axis
      .ticks(this.calculateAxisTickCount())
      .tickPadding(6)
      .tickSizeOuter(0)
      .tickSizeInner(0)
      .tickFormat(this.scale.getTickFormatter() as (value: AxisDomain) => string);
  }

  protected customizeAxis(selection: Selection<SVGGElement, unknown, null, undefined>): void {
    if (!this.configuration.axisLine) {
      selection.selectAll('.domain, .tick:first-of-type').remove();
    }

    if (!this.configuration.tickLabels) {
      selection.selectAll('.tick text').remove();
    }
  }

  private maybeTruncateAxisTicks(axisSvgSelection: Selection<SVGGElement, unknown, null, undefined>): void {
    const ticksSelection = axisSvgSelection.selectAll('text');
    const tickBandwidth = (this.scale.getRangeEnd() - this.scale.getRangeStart()) / ticksSelection.size();

    ticksSelection.each((_datum, index, nodes) =>
      this.svgUtilService.truncateText(nodes[index] as SVGTextElement, tickBandwidth)
    );
  }

  private getAxisTransform(): string {
    switch (this.configuration.location) {
      case AxisLocation.Left:
        return `translate(${this.scale.initData.bounds.startX}, 0)`;
      case AxisLocation.Right:
        return `translate(${this.scale.initData.bounds.endX}, 0)`;
      case AxisLocation.Top:
        return `translate(0, ${this.scale.initData.bounds.endY})`;
      case AxisLocation.Bottom:
      default:
        return `translate(0, ${this.scale.initData.bounds.startY})`;
    }
  }

  private getAxisConstructor(): (scale: AxisScale<AxisDomain>) => D3Axis<AxisDomain> {
    switch (this.configuration.location) {
      case AxisLocation.Left:
        return axisLeft;
      case AxisLocation.Right:
        return axisRight;
      case AxisLocation.Top:
        return axisTop;
      case AxisLocation.Bottom:
      default:
        return axisBottom;
    }
  }

  private calculateAxisTickCount(): number {
    return 6;
  }

  private addGridLinesIfNeeded(): void {
    if (!this.axisElement || !this.configuration.gridLines) {
      return;
    }

    const gridLineAxis = this.getAxisConstructor()(this.scale.d3Implementation as AxisScale<AxisDomain>)
      .ticks(this.calculateAxisTickCount())
      .tickSize(-this.getPerpendicularDistance())
      .tickFormat(() => '');

    select(this.axisElement)
      .append('g')
      .classed('grid-line', true)
      .classed(CartesianNoDataMessage.NO_DATA_HIDABLE_CSS_CLASS, true)
      .call(gridLineAxis)
      .selectAll('.domain, .tick:first-of-type')
      .remove();
  }

  private getPerpendicularDistance(): number {
    switch (this.configuration.location) {
      case AxisLocation.Left:
      case AxisLocation.Right:
        return Math.abs(this.scale.initData.bounds.endX - this.scale.initData.bounds.startX);
      default:
      case AxisLocation.Top:
      case AxisLocation.Bottom:
        return Math.abs(this.scale.initData.bounds.endY - this.scale.initData.bounds.startY);
    }
  }

  private applyDefaults(configuration: Axis): DefaultedAxisConfig {
    const defaultValues = {
      gridLines: false,
      axisLine: true,
      tickLabels: true
    };

    return defaultsDeep({}, this.scale.initData, configuration, defaultValues) as typeof configuration &
      typeof defaultValues &
      ScaleInitializationData<TData>;
  }
}

type DefaultedAxisConfig = Axis & Omit<Required<Axis>, 'scale' | 'crosshair' | 'min' | 'max'>;
