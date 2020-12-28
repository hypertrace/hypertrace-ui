import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync } from '@angular/core/testing';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { SplitterComponent } from './splitter.component';

import { RouterTestingModule } from '@angular/router/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { PopoverService } from '../popover/popover.service';
import { SplitterModule } from './splitter.module';

describe('Copy to Clipboard component', () => {
  let spectator: Spectator<SplitterComponent>;

  const mockElement = document.createElement('textarea');
  const createElementSpy = jest.fn().mockReturnValue(mockElement);
  const appendChildSpy = jest.fn();
  const removeChildSpy = jest.fn();
  const execCommandSpy = jest.fn();
  const mockPopoverRef = {
    close: jest.fn()
  };
  const createHost = createHostFactory({
    declareComponent: false,
    component: SplitterComponent,
    providers: [
      mockProvider(PopoverService, {
        drawPopover: jest.fn().mockReturnValue(mockPopoverRef)
      })
    ],
    imports: [SplitterModule, HttpClientTestingModule, IconLibraryTestingModule, RouterTestingModule]
  });

  test('correctly copies the text to clipboard', fakeAsync(() => {
    spectator = createHost(
      `<ht-splitter [text]="textToBeCopied" label="Copy to Clipboard"></ht-splitter>`,
      {
        hostProps: {
          textToBeCopied: 'Text to be copied'
        }
      }
    );

    // tslint:disable-next-line: deprecation
    document.createElement = createElementSpy;
    document.body.appendChild = appendChildSpy;
    document.body.removeChild = removeChildSpy;
    document.execCommand = execCommandSpy;

    expect(spectator.query('.icon')).toExist();
    expect(spectator.query('.label')).toHaveText('Copy to Clipboard');

    const element = spectator.query('.ht-splitter');
    expect(element).toExist();

    spectator.click(element!);
    spectator.tick();

    expect(createElementSpy).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalledWith(mockElement);
    expect(execCommandSpy).toHaveBeenCalledWith('copy');
    expect(removeChildSpy).toHaveBeenCalledWith(mockElement);

    spectator.tick();
    expect(spectator.inject(PopoverService).drawPopover).toHaveBeenCalled();
    spectator.tick(4000);
    expect(mockPopoverRef.close).toHaveBeenCalled();
  }));
});
