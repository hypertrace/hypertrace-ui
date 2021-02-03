import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { SplitterDirection } from './splitter';
import { SplitterService } from './splitter.service';

describe('Splitter service', () => {
  let spectator: SpectatorService<SplitterService>;

  let hostElement: HTMLElement;
  let parentElement: HTMLElement;
  let previousSibling: HTMLElement;
  let nextSibling: HTMLElement;

  const createService = createServiceFactory({
    service: SplitterService
  });

  const buildHTMLElement = (
    domRect: DOMRect,
    parent?: HTMLElement,
    previous?: HTMLElement,
    next?: HTMLElement
  ): Partial<HTMLElement> => ({
    previousElementSibling: previous,
    nextElementSibling: next,
    parentElement: parent,
    style: {
      width: '10px',
      height: '10px'
    } as CSSStyleDeclaration,
    getBoundingClientRect: () => domRect
  });

  beforeEach(() => {
    parentElement = buildHTMLElement({
      height: 100,
      width: 100,
      x: 0,
      y: 0
    } as DOMRect) as HTMLElement;

    previousSibling = buildHTMLElement(
      {
        height: 10,
        width: 100,
        x: 0,
        y: 0
      } as DOMRect,
      parentElement
    ) as HTMLElement;

    nextSibling = buildHTMLElement(
      {
        height: 87,
        width: 100,
        x: 0,
        y: 0
      } as DOMRect,
      parentElement
    ) as HTMLElement;

    hostElement = buildHTMLElement(
      {
        height: 10,
        width: 100,
        x: 0,
        y: 0
      } as DOMRect,
      parentElement,
      previousSibling,
      nextSibling
    ) as HTMLElement;
  });

  test('should show all elements and delegate to service method correctly', () => {
    spectator = createService();

    spectator.service.buildSplitterLayoutChangeObservable(hostElement, parentElement, SplitterDirection.Vertical);
  });
});
