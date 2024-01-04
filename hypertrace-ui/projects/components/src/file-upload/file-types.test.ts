import { FileTypeUtil, SupportedFileType } from './file-types';

describe('FileTypes', () => {
  test('should return supported file extensions correctly', () => {
    expect(FileTypeUtil.supportedFileExtensions([SupportedFileType.Json, SupportedFileType.Yaml])).toEqual([
      '.json',
      '.yaml',
      '.yml',
    ]);
  });

  test('should return supported file extensions set correctly', () => {
    expect(FileTypeUtil.supportedFileExtensionsSet([SupportedFileType.Json, SupportedFileType.Yaml])).toEqual(
      new Set(['.json', '.yaml', '.yml']),
    );
  });

  test('should return supported mime types correctly', () => {
    expect(FileTypeUtil.supportedFileMimeTypes([SupportedFileType.Json, SupportedFileType.Yaml])).toEqual([
      'application/json',
      'application/x-yaml',
      'text/yaml',
      'text/x-yaml',
      'application/yaml',
    ]);
  });

  test('should return supported mime types set correctly', () => {
    expect(FileTypeUtil.supportedFileMimeTypesSet([SupportedFileType.Json, SupportedFileType.Yaml])).toEqual(
      new Set(['application/json', 'application/x-yaml', 'text/yaml', 'text/x-yaml', 'application/yaml']),
    );
  });
});
