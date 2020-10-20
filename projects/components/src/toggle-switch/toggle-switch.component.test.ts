import { async } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { TextareaComponent } from './textarea.component';
import { TraceTextareaModule } from './textarea.module';

describe('Textarea Component', () => {
  let spectator: Spectator<TextareaComponent>;
  let logSpy: jasmine.Spy;

  const createHost = createHostFactory({
    component: TextareaComponent,
    imports: [TraceTextareaModule, NoopAnimationsModule],
    declareComponent: false
  });

  beforeEach(async(() => {
    logSpy = spyOn(console, 'warn');
  }));

  test('should warn when placeholder is not provided', () => {
    spectator = createHost(`<ht-textarea></ht-textarea>`);

    expect(logSpy).toHaveBeenCalled();
  });

  test('should not warn when placeholder is provided', () => {
    spectator = createHost(`<ht-textarea [placeholder]="placeholder"></ht-textarea>`, {
      hostProps: {
        placeholder: 'TEST'
      }
    });

    expect(logSpy).not.toHaveBeenCalled();
  });

  test('should apply disabled attribute when disabled', () => {
    spectator = createHost(`<ht-textarea [placeholder]="placeholder" [disabled]="disabled"></ht-textarea>`, {
      hostProps: {
        placeholder: 'TEST',
        disabled: true
      }
    });

    const disabled = spectator.query('textarea')!.getAttribute('ng-reflect-disabled');

    expect(disabled).toBe('true');
  });
});
