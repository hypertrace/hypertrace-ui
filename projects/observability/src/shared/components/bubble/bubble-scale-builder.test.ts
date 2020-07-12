import { scaleLinear } from 'd3-scale';
import { BubbleScaleBuilder } from './bubble-scale-builder';
import { Bubble, ScaledLayout } from './scaled-layout';

describe('Bubble Scale Builder Test', () => {
  let bubbleScaleBuilder: BubbleScaleBuilder;

  /**
   * xMin = (-1 - 5) = -6
   * xMax = (5 + 10) = 15
   * yMin = (2 - 10) = -8
   * yMax = (10 + 5) = 15
   *
   * xAxis = xMax - xMin = 21
   * yAxis = xMax - yMin = 23
   * rMax = Math.max(21, 23) = 23 (as r can't go beyond the axis lengths)
   */
  const bubbleData: Bubble[] = [
    {
      x: -1,
      y: 10,
      r: 5
    },
    {
      x: 5,
      y: 2,
      r: 10
    }
  ];

  const scaledLayout: ScaledLayout = {
    rect: {
      width: 200,
      height: 500
    },
    scaleFactor: 1.5
  };

  beforeEach(() => {
    bubbleScaleBuilder = new BubbleScaleBuilder();
  });

  test('correct axis length from scale', () => {
    const scale = scaleLinear().domain([-10, 20]);
    expect(bubbleScaleBuilder.getAxisLength(scale)).toBe(30);
  });

  test('x domain scale based on data', () => {
    const xDomainScale = bubbleScaleBuilder.getXDomain(bubbleData);
    // Xmin from data
    expect(xDomainScale.domain()[0]).toBe(-6);
    // Xmax from data
    expect(xDomainScale.domain()[1]).toBe(15);
  });

  test('x domain scale based on min and max', () => {
    const xDomainScale = bubbleScaleBuilder.getXDomain(bubbleData, -1, 9);
    // Xmin as requestedMin i.e -1
    expect(xDomainScale.domain()[0]).toBe(-1);
    // Xmax as requestedMax i.e 9
    expect(xDomainScale.domain()[1]).toBe(9);
  });

  test('y domain scale based on data', () => {
    const xDomainScale = bubbleScaleBuilder.getYDomain(bubbleData);
    // Ymin from data i.e -8
    expect(xDomainScale.domain()[0]).toBe(-8);
    // Ymax from data i.e 15
    expect(xDomainScale.domain()[1]).toBe(15);
  });

  test('y domain scale based on min and max', () => {
    const xDomainScale = bubbleScaleBuilder.getYDomain(bubbleData, -10, 20);
    // Ymin as requestedMin i.e -10
    expect(xDomainScale.domain()[0]).toBe(-10);
    // Ymax as requestedMin i.e 20
    expect(xDomainScale.domain()[1]).toBe(20);
  });

  test('builds x scale correctly', () => {
    const xScale = bubbleScaleBuilder.getXScale(bubbleData, scaledLayout);
    expect(xScale.range()[0]).toBe(0);
    expect(xScale.range()[1]).toBe(scaledLayout.rect.width);
  });

  test('builds y scale correctly', () => {
    const yScale = bubbleScaleBuilder.getYScale(bubbleData, scaledLayout);
    expect(yScale.range()[0]).toBe(scaledLayout.rect.height);
    expect(yScale.range()[1]).toBe(0);
  });

  test('builds r scale correctly', () => {
    const xScale = bubbleScaleBuilder.getXScale(bubbleData, scaledLayout);
    const yScale = bubbleScaleBuilder.getYScale(bubbleData, scaledLayout);
    const rScale = bubbleScaleBuilder.getRScale(scaledLayout, xScale, yScale);

    // R domain min should always be 0
    expect(rScale.domain()[0]).toBe(0);
    // R domain max from xAxis and yAxis lengths
    expect(rScale.domain()[1]).toBe(23);

    // R range min should always be 0
    expect(rScale.range()[0]).toBe(0);
    // R range max = scaleFactor * R domain max = 1.5 * 23 = 34.5
    expect(rScale.range()[1]).toBe(34.5);
  });
});
