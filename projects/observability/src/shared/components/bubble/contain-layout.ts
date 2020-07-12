import { BubbleScaleBuilder } from './bubble-scale-builder';
import { Bubble, EasyRect, ScaledLayout } from './scaled-layout';

export class ContainLayout {
  private readonly bubbleScaleBuilder: BubbleScaleBuilder;

  public constructor(bubbleScaleBuilder: BubbleScaleBuilder) {
    this.bubbleScaleBuilder = bubbleScaleBuilder;
  }

  public getLayout(
    data: Bubble[],
    dimensions: EasyRect,
    requestedXMin?: number,
    requestedXMax?: number,
    requestedYMin?: number,
    requestedYMax?: number
  ): ScaledLayout {
    const width = dimensions.width;
    const height = dimensions.height;

    const xDomain = this.bubbleScaleBuilder.getXDomain(data, requestedXMin, requestedXMax);
    const yDomain = this.bubbleScaleBuilder.getYDomain(data, requestedYMin, requestedYMax);

    const xAxisLength = this.bubbleScaleBuilder.getAxisLength(xDomain);
    const yAxisLength = this.bubbleScaleBuilder.getAxisLength(yDomain);

    const xScaleFactor = width / xAxisLength;
    const yScaleFactor = height / yAxisLength;

    if (xScaleFactor < yScaleFactor) {
      return {
        rect: {
          width: width,
          height: yAxisLength * xScaleFactor
        },
        scaleFactor: xScaleFactor
      };
    }

    return {
      rect: {
        width: xAxisLength * yScaleFactor,
        height: height
      },
      scaleFactor: yScaleFactor
    };
  }
}
