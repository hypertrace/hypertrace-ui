import { BubbleScaleBuilder } from './bubble-scale-builder';
import { ContainLayout } from './contain-layout';
import { Bubble, EasyRect } from './scaled-layout';

describe('Contain Layout Test', () => {
  const bubbleScaleBuilder: BubbleScaleBuilder = new BubbleScaleBuilder();
  let containLayout: ContainLayout;

  // X axis length = 20, Y axis length = 30
  const bubbleData: Bubble[] = [
    {
      x: 0,
      y: 20,
      r: 5
    },
    {
      x: 5,
      y: 5,
      r: 10
    }
  ];

  beforeEach(() => {
    containLayout = new ContainLayout(bubbleScaleBuilder);
  });

  test('build scale layout using dimensions width', () => {
    const dimensions: EasyRect = {
      width: 100,
      height: 400
    };

    const scaledLayout = containLayout.getLayout(bubbleData, dimensions);

    expect(scaledLayout.scaleFactor).toBe(5);
    expect(scaledLayout.rect.width).toBe(100);
    expect(scaledLayout.rect.height).toBe(150);
  });

  test('build scale layout using dimensions height', () => {
    const dimensions: EasyRect = {
      width: 400,
      height: 120
    };

    const scaledLayout = containLayout.getLayout(bubbleData, dimensions);

    expect(scaledLayout.scaleFactor).toBe(4);
    expect(scaledLayout.rect.width).toBe(80);
    expect(scaledLayout.rect.height).toBe(120);
  });
});
