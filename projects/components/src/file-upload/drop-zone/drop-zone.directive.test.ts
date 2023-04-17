import { createDirectiveFactory } from '@ngneat/spectator/jest';
import { DropZoneDirective } from './drop-zone.directive';

describe('Drop Zone Directive', () => {
  const createDirective = createDirectiveFactory({ directive: DropZoneDirective });

  test('should emit events correctly', () => {
    const spectator = createDirective(`<div class="content" htDropZone></div>`);

    jest.spyOn(spectator.directive.dragHover, 'emit').mockImplementation(() => {});
    jest.spyOn(spectator.directive.dropped, 'emit').mockImplementation(() => {});

    spectator.dispatchMouseEvent(spectator.element, 'dragover');
    expect(spectator.directive.dropped.emit).toHaveBeenCalledTimes(0);
    expect(spectator.directive.dragHover.emit).toHaveBeenCalledWith(true);

    spectator.dispatchMouseEvent(spectator.element, 'dragleave');
    expect(spectator.directive.dropped.emit).toHaveBeenCalledTimes(0);
    expect(spectator.directive.dragHover.emit).toHaveBeenCalledWith(false);

    spectator.dispatchMouseEvent(spectator.element, 'drop');
    expect(spectator.directive.dropped.emit).toHaveBeenCalledWith(undefined);
    expect(spectator.directive.dragHover.emit).toHaveBeenCalledWith(false);
  });
});
