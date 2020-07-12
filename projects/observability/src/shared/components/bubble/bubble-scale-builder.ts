import { max, min } from 'd3-array';
import { ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { Bubble, ScaledLayout } from './scaled-layout';

export class BubbleScaleBuilder {
  public getXDomain(
    data: Bubble[],
    requestedMin?: number,
    requestedMax?: number
  ): ScaleContinuousNumeric<number, number> {
    return this.getLinearScaleDomain(
      data.flatMap(datum => [datum.x - datum.r, datum.x + datum.r]),
      requestedMin,
      requestedMax
    );
  }

  public getYDomain<T extends Bubble>(
    data: T[],
    requestedMin?: number,
    requestedMax?: number
  ): ScaleContinuousNumeric<number, number> {
    return this.getLinearScaleDomain(
      data.flatMap(datum => [datum.y - datum.r, datum.y + datum.r]),
      requestedMin,
      requestedMax
    );
  }

  public getXScale(
    data: Bubble[],
    scaledLayout: ScaledLayout,
    requestedMin?: number,
    requestedMax?: number
  ): ScaleContinuousNumeric<number, number> {
    const xDomain = this.getXDomain(data, requestedMin, requestedMax);
    const scaledRect = scaledLayout.rect;

    return xDomain.range([0, scaledRect.width]);
  }

  public getYScale(
    data: Bubble[],
    scaledLayout: ScaledLayout,
    requestedMin?: number,
    requestedMax?: number
  ): ScaleContinuousNumeric<number, number> {
    const yDomain = this.getYDomain(data, requestedMin, requestedMax);
    const scaledRect = scaledLayout.rect;

    return yDomain.range([scaledRect.height, 0]);
  }

  public getRScale(
    scaledLayout: ScaledLayout,
    xScale: ScaleContinuousNumeric<number, number>,
    yScale: ScaleContinuousNumeric<number, number>
  ): ScaleContinuousNumeric<number, number> {
    const rDomain = this.getR(xScale, yScale);
    const scaleFactor = scaledLayout.scaleFactor;

    return rDomain.range([0, this.getRMaxRange(rDomain, scaleFactor)]);
  }

  public getAxisLength(scale: ScaleContinuousNumeric<number, number>): number {
    return this.getDomainMax(scale) - this.getDomainMin(scale);
  }

  private getR(
    xScale: ScaleContinuousNumeric<number, number>,
    yScale: ScaleContinuousNumeric<number, number>
  ): ScaleContinuousNumeric<number, number> {
    const x = this.getAxisLength(xScale);
    const y = this.getAxisLength(yScale);

    return this.buildScale(0, Math.max(x, y));
  }

  private getRMaxRange(rDomain: ScaleContinuousNumeric<number, number>, scale: number): number {
    return this.getDomainMax(rDomain) * scale;
  }

  private getLinearScaleDomain(
    data: number[],
    requestedMin?: number,
    requestedMax?: number
  ): ScaleContinuousNumeric<number, number> {
    const minDataValue = requestedMin !== undefined ? requestedMin : min(data);
    const maxDataValue = requestedMax !== undefined ? requestedMax : max(data);

    return this.buildScale(
      minDataValue !== undefined ? minDataValue : 0,
      maxDataValue !== undefined ? maxDataValue : 0
    );
  }

  private getDomainMin(scale: ScaleContinuousNumeric<number, number>): number {
    return scale.domain()[0];
  }

  private getDomainMax(scale: ScaleContinuousNumeric<number, number>): number {
    return scale.domain()[1];
  }

  private buildScale(minimum: number, maximum: number): ScaleContinuousNumeric<number, number> {
    return scaleLinear().domain([minimum, maximum]);
  }
}
