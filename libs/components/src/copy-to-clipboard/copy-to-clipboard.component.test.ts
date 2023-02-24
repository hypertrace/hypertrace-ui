import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync } from '@angular/core/testing';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { CopyToClipboardComponent } from './copy-to-clipboard.component';

import { RouterTestingModule } from '@angular/router/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { PopoverService } from '../popover/popover.service';
import { CopyToClipboardModule } from './copy-to-clipboard.module';

describe('Copy to Clipboard component', () => {
  let spectator: Spectator<CopyToClipboardComponent>;

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
    component: CopyToClipboardComponent,
    providers: [
      mockProvider(PopoverService, {
        drawPopover: jest.fn().mockReturnValue(mockPopoverRef)
      })
    ],
    imports: [CopyToClipboardModule, HttpClientTestingModule, IconLibraryTestingModule, RouterTestingModule]
  });

  test('correctly copies the text to clipboard', fakeAsync(() => {
    spectator = createHost(
      `<ht-copy-to-clipboard [tooltipDuration]="tooltipDuration" [text]="textToBeCopied" label="Copy to Clipboard"></ht-copy-to-clipboard>`,
      {
        hostProps: {
          textToBeCopied: 'Text to be copied',
          tooltipDuration: 1000
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

    const element = spectator.query('.ht-copy-to-clipboard');
    expect(element).toExist();

    spectator.click(element!);
    spectator.tick();

    expect(createElementSpy).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalledWith(mockElement);
    expect(execCommandSpy).toHaveBeenCalledWith('copy');
    expect(removeChildSpy).toHaveBeenCalledWith(mockElement);

    spectator.tick();
    expect(spectator.inject(PopoverService).drawPopover).toHaveBeenCalled();
    spectator.tick(1001);
    expect(mockPopoverRef.close).toHaveBeenCalled();
  }));
});
