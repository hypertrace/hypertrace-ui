import { LayoutChangeService, MemoizeModule } from '@hypertrace/common';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { SplitterDirection } from './splitter';
import { SplitterComponent } from './splitter.component';
import { fakeAsync } from '@angular/core/testing';
import { SplitterContentDirective } from './splitter-content.directive';

describe('Splitter component', () => {
  let spectator: SpectatorHost<SplitterComponent>;

  const createHost = createHostFactory({
    component: SplitterComponent,
    shallow: true,
    declarations: [SplitterContentDirective],
    imports: [MemoizeModule],
    providers: [
      mockProvider(LayoutChangeService, {
        publishLayoutChange: jest.fn()
      })
    ]
  });

  test('should show all elements for horizontal direction', fakeAsync(() => {
    const onLayoutChangeSpy = jest.fn();
    spectator = createHost(
      `<ht-splitter [direction]="direction" (layoutChange)="onLayoutChange($event)">
        <ng-container *ngFor="let dimension of dimensions">
          <div *htSplitterContent="dimension">Some content</div>
        </ng-container>
      </ht-splitter>`,
      {
        hostProps: {
          direction: SplitterDirection.Horizontal,
          dimensions: [
            { value: 1, unit: 'FR' },
            { value: 2, unit: 'FR' }
          ],
          onLayoutChange: onLayoutChangeSpy
        }
      }
    );
    spectator.tick();

    expect(spectator.query('.splitter-container')).toExist();

    const splitters = spectator.queryAll('.splitter');
    expect(splitters.length).toEqual(1);
    splitters.forEach(splitter => expect(splitter).toHaveClass('splitter horizontal'));
    expect(spectator.query('.cursor')).toExist();

    // Trigger Mouse Down
    spectator.dispatchMouseEvent(
      splitters[0],
      'mousedown',
      undefined,
      undefined,
      Object.assign(
        new MouseEvent('mousedown', {
          clientX: 0
        }),
        { pageX: 0 }
      ) as MouseEvent
    );

    // Trigger Mouse Move
    spectator.dispatchMouseEvent(
      splitters[0],
      'mousemove',
      undefined,
      undefined,
      Object.assign(
        new MouseEvent('mousemove', {
          clientX: 10
        }),
        { pageX: 10 }
      ) as MouseEvent
    );

    // Trigger Mouse Up
    spectator.dispatchMouseEvent(splitters[0], 'mouseup');

    expect(onLayoutChangeSpy).toHaveBeenCalled();
    expect(spectator.inject(LayoutChangeService).publishLayoutChange).toHaveBeenCalled();
  }));

  test('should show all elements for vertical direction', fakeAsync(() => {
    const onLayoutChangeSpy = jest.fn();
    spectator = createHost(
      `<ht-splitter [direction]="direction" (layoutChange)="onLayoutChange($event)">
        <ng-container *ngFor="let dimension of dimensions">
          <div *htSplitterContent="dimension">Some content</div>
        </ng-container>
      </ht-splitter>`,
      {
        hostProps: {
          direction: SplitterDirection.Vertical,
          dimensions: [
            { value: 1, unit: 'FR' },
            { value: 2, unit: 'FR' }
          ],
          onLayoutChange: onLayoutChangeSpy
        }
      }
    );
    spectator.tick();

    expect(spectator.query('.splitter-container')).toExist();

    const splitters = spectator.queryAll('.splitter');
    expect(splitters.length).toEqual(2);
    splitters.forEach(splitter => expect(splitter).toHaveClass('splitter vertical'));
    expect(spectator.query('.cursor')).toExist();

    // Trigger Mouse Down
    spectator.dispatchMouseEvent(
      splitters[0],
      'mousedown',
      undefined,
      undefined,
      Object.assign(
        new MouseEvent('mousedown', {
          clientX: 0
        }),
        { pageX: 0 }
      ) as MouseEvent
    );

    // Trigger Mouse Move
    spectator.dispatchMouseEvent(
      splitters[0],
      'mousemove',
      undefined,
      undefined,
      Object.assign(
        new MouseEvent('mousemove', {
          clientX: 10
        }),
        { pageX: 10 }
      ) as MouseEvent
    );

    // Trigger Mouse Up
    spectator.dispatchMouseEvent(splitters[0], 'mouseup');

    expect(onLayoutChangeSpy).toHaveBeenCalled();
    expect(spectator.inject(LayoutChangeService).publishLayoutChange).toHaveBeenCalled();
  }));
});
