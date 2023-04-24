import { createPipeFactory } from '@ngneat/spectator/jest';
import { FileTypePipe } from './file-type.pipe';

describe('FileTypePipe', () => {
  const createPipe = createPipeFactory({
    pipe: FileTypePipe
  });

  test('should return the correct file type', () => {
    const spectator = createPipe(`<div>{{'json' | htFilePipe}}</div>`);
    expect(spectator.element).toHaveText('.json');
  });

  test('should return the correct file type when array passed', () => {
    const spectator = createPipe(`<div>{{['json', 'yaml'] | htFilePipe}}</div>`);
    expect(spectator.element).toHaveText('.json, .yaml');
  });

  test('should return the unknown file type', () => {
    const spectator = createPipe(`<div>{{'png' | htFilePipe}}</div>`);
    expect(spectator.element).toHaveText('Unknown');
  });
});
