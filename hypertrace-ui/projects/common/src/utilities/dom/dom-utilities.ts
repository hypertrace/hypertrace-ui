export const enum SelectorType {
  Class,
  Element,
  Attribute,
}

/**
 * Converts provided string into the requested selector type
 */
export const selector = (name: string, type: SelectorType = SelectorType.Class): string => {
  switch (type) {
    case SelectorType.Element:
      return name;
    case SelectorType.Attribute:
      return `[${name}]`;
    case SelectorType.Class:
    default:
      return `.${name}`;
  }
};

/**
 * Converts provided strings into the requested selector type
 */

export const selectorAny = (...names: string[]): string => names.map(name => selector(name)).join(',');

export type ClientRectBounds = Omit<DOMRect, 'x' | 'y' | 'toJSON'>;

export const unionOfClientRects = (...rects: ClientRectBounds[]): ClientRectBounds => {
  const bounds = (rects as Omit<ClientRectBounds, 'width' | 'height'>[]).reduce((currentUnion, domRect) => ({
    left: Math.min(currentUnion.left, domRect.left),
    right: Math.max(currentUnion.right, domRect.right),
    top: Math.min(currentUnion.top, domRect.top),
    bottom: Math.max(currentUnion.bottom, domRect.bottom),
  }));

  return {
    ...bounds,
    width: bounds.right - bounds.left,
    height: bounds.bottom - bounds.top,
  };
};
