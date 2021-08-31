import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { TextareaComponent } from './textarea.component';
import { TraceTextareaModule } from './textarea.module';

describe('Textarea Component', () => {
  let spectator: Spectator<TextareaComponent>;
  let logSpy: jest.SpyInstance = jest.spyOn(console, 'warn');

  const createHost = createHostFactory({
    component: TextareaComponent,
    imports: [TraceTextareaModule, NoopAnimationsModule],
    declareComponent: false
  });

  test('should warn when placeholder is not provided', () => {
    spectator = createHost(`<ht-textarea></ht-textarea>`);

    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });

  test('should not warn when placeholder is provided', () => {
    spectator = createHost(`<ht-textarea [placeholder]="placeholder"></ht-textarea>`, {
      hostProps: {
        placeholder: 'TEST'
      }
    });

    expect(logSpy).not.toHaveBeenCalled();
    logSpy.mockRestore();
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

  test('should match the rows with the number of rows in the textarea', () => {
    const rows = 10;

    spectator = createHost(`<ht-textarea [placeholder]="placeholder" [rows]="rows"></ht-textarea>`, {
      hostProps: {
        placeholder: 'TEST',
        rows: rows
      }
    });

    expect((spectator.query('.textarea') as HTMLTextAreaElement).rows).toBe(rows);
  });
});
