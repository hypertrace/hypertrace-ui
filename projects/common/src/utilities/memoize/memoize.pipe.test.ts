import { Component } from '@angular/core';
import { byText, createHostFactory } from '@ngneat/spectator/jest';
import { MemoizePipe } from './memoize.pipe';

describe('Memoize pipe', () => {
  const createHost = createHostFactory({
    component: Component({
      selector: 'pipe-holder',
      template: '<ng-content></ng-content>'
    })(class {}), // A bit weird, jest doesn't have support for testing pipes
    declarations: [MemoizePipe]
  });
  test('should call the function only once', () => {
    const mockFn = jest.fn(() => 'text');
    const spectator = createHost(
      `
    <pipe-holder>
      {{ hostFn | htMemoize }}
    </pipe-holder>`,
      {
        hostProps: {
          hostFn: mockFn
        }
      }
    );
    // Add in a second change detection - an impure pipe would be called again
    spectator.detectChanges();
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(spectator.query(byText('text'))).toExist();
  });

  test('supports parameters and updates on change', () => {
    const mockFn = jest.fn((...args: string[]) => args.join(','));
    const spectator = createHost(
      `
    <pipe-holder>
      {{ hostFn | htMemoize : arg1 : arg2 }}
    </pipe-holder>`,
      {
        hostProps: {
          hostFn: mockFn,
          arg1: 'foo',
          arg2: 'alpha'
        }
      }
    );
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(spectator.query(byText('foo,alpha'))).toExist();

    spectator.setHostInput({
      arg1: 'bar'
    });
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(spectator.query(byText('bar,alpha'))).toExist();

    spectator.setHostInput({
      arg2: 'beta'
    });
    expect(mockFn).toHaveBeenCalledTimes(3);
    expect(spectator.query(byText('bar,beta'))).toExist();
  });
});
