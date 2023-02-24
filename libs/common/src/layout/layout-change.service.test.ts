import { recordObservable, runFakeRxjs } from '@hypertrace/test-utils';
import { ReplayObservable } from '../utilities/rxjs/rxjs-utils';
import { LayoutChangeService } from './layout-change.service';

describe('LayoutChangeService', () => {
  let parentService: LayoutChangeService;
  let childService: LayoutChangeService;
  let parentSize!: Size;
  let childSize!: Size;
  let parentLayout$: ReplayObservable<void>;
  let childLayout$: ReplayObservable<void>;
  const voidMarbleDefinition = { x: undefined };

  const createAndInitializeService = (parent?: LayoutChangeService): ServiceCreationResult => {
    const size = { width: 100, height: 100 };
    const service = new LayoutChangeService(
      {
        nativeElement: {
          getBoundingClientRect: jest.fn(() => size)
        }
      },
      parent
    );

    service.initialize();

    return {
      size: size,
      service: service,
      recordedLayout: recordObservable(service.layout$)
    };
  };

  beforeEach(() => {
    const parent = createAndInitializeService();
    parentService = parent.service;
    parentSize = parent.size;
    parentLayout$ = parent.recordedLayout;
    const child = createAndInitializeService(parent.service);
    childService = child.service;
    childSize = child.size;
    childLayout$ = child.recordedLayout;
  });

  test('always reflects a layout change back to the initiator', () => {
    runFakeRxjs(({ expectObservable }) => {
      childService.publishLayoutChange();
      expectObservable(parentLayout$).toBe('');
      expectObservable(childLayout$).toBe('x', voidMarbleDefinition);
    });
  });

  test('propagates debounced window resize events', () => {
    runFakeRxjs(({ expectObservable }) => {
      parentSize.width = 200; // Without a size change, the resize will be filtered out
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('resize')); // Should be skipped, only one change event will come through
      expectObservable(parentLayout$).toBe('80ms x', voidMarbleDefinition);
    });
  });

  test('stops propagation to children if element size has not changed', () => {
    runFakeRxjs(({ expectObservable }) => {
      childSize.width = 200;
      parentService.publishLayoutChange();
      parentService.publishLayoutChange();
      expectObservable(parentLayout$).toBe('(xx)', voidMarbleDefinition);
      expectObservable(childLayout$).toBe('x', voidMarbleDefinition);
    });
  });

  test('stops propagation to parents, and instead broadcasts if element size has not changed', () => {
    runFakeRxjs(({ expectObservable }) => {
      childSize.width = 200;
      childService.publishLayoutChange();
      childService.publishLayoutChange();
      expectObservable(childLayout$).toBe('(xx)', voidMarbleDefinition);
      expectObservable(parentLayout$).toBe('x', voidMarbleDefinition);
    });
  });

  test('completes observable on destroy', () => {
    runFakeRxjs(({ expectObservable }) => {
      childService.publishLayoutChange();
      // tslint:disable-next-line: no-lifecycle-call
      childService.ngOnDestroy();
      expectObservable(childLayout$).toBe('(x|)', voidMarbleDefinition);
    });
  });

  test('layout change effects parent and siblings if size changed', () => {
    runFakeRxjs(({ expectObservable }) => {
      const secondChild = createAndInitializeService(parentService);
      childSize.width = 200;
      secondChild.size.width = 200;
      childService.publishLayoutChange();
      expectObservable(childLayout$).toBe('x', voidMarbleDefinition);
      expectObservable(secondChild.recordedLayout).toBe('x', voidMarbleDefinition);
      expectObservable(parentLayout$).toBe('x', voidMarbleDefinition);
    });
  });
});

interface Size {
  width: number;
  height: number;
}

interface ServiceCreationResult {
  service: LayoutChangeService;
  size: Size;
  recordedLayout: ReplayObservable<void>;
}
