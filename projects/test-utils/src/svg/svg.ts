export const addWidthAndHeightToSvgElForTest = (el: SVGSVGElement, width: number, height: number) => {
  // Certain D3 internals require measurements on elements, which JSDom does not provide. patch them here.
  const makeLength = (length: number): SVGAnimatedLength => ({
    baseVal: {
      value: length
    } as SVGLength,
    animVal: {
      value: length
    } as SVGLength
  });

  const writableSvg: Writeable<SVGSVGElement> = el;
  writableSvg.width = makeLength(width);
  writableSvg.height = makeLength(height);
};

export type Writeable<T> = { -readonly [P in keyof T]: T[P] };
