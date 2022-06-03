import { createPipeFactory } from '@ngneat/spectator/jest';
import { DisplayFileSizePipe } from './display-file-size.pipe';

describe('Display File Size Pipe', () => {
  const createPipe = createPipeFactory(DisplayFileSizePipe);

  test('should return correct size in Bytes', () => {
    const spectator = createPipe(`{{ 1 | htDisplayFileSize}}`);
    expect(spectator.element).toHaveText('1 B');
  });

  test('should return correct size in KiloBytes', () => {
    const spectator = createPipe(`{{ 102.4 | htDisplayFileSize}}`);
    expect(spectator.element).toHaveText('0.1 KB');
  });

  test('should return correct size in MegaBytes', () => {
    const spectator = createPipe(`{{ 1024 * 102.4 | htDisplayFileSize}}`);
    expect(spectator.element).toHaveText('0.1 MB');
  });

  test('should return correct size in GigaBytes', () => {
    const spectator = createPipe(`{{ 1024 * 1024 * 102.4 | htDisplayFileSize}}`);
    expect(spectator.element).toHaveText('0.1 GB');
  });
});
