import { createDirectiveFactory } from '@ngneat/spectator/jest';
import { DropZoneDirective } from './drop-zone.directive';

describe('Drop Zone Directive', () => {
  const createDirective = createDirectiveFactory({ directive: DropZoneDirective });

  test('should emit events correctly', () => {
    const spectator = createDirective(`<div class="content" htDropZone></div>`);

    spyOn(spectator.directive.dragOver, 'emit');
    spyOn(spectator.directive.dropped, 'emit');

    spectator.dispatchMouseEvent(spectator.element, 'dragover');
    expect(spectator.directive.dropped.emit).toHaveBeenCalledTimes(0);
    expect(spectator.directive.dragOver.emit).toHaveBeenCalledWith(true);

    spectator.dispatchMouseEvent(spectator.element, 'dragleave');
    expect(spectator.directive.dropped.emit).toHaveBeenCalledTimes(0);
    expect(spectator.directive.dragOver.emit).toHaveBeenCalledWith(false);

    spectator.dispatchMouseEvent(spectator.element, 'drop');
    expect(spectator.directive.dropped.emit).toHaveBeenCalledWith(undefined);
    expect(spectator.directive.dragOver.emit).toHaveBeenCalledWith(false);
  });
});
