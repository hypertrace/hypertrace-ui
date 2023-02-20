// tslint:disable:no-namespace
export enum SupportedFileType {
  Json = 'json',
  Yaml = 'yaml'
}

export const SUPPORTED_FILE_TYPE_METADATA_MAP: Map<SupportedFileType, SupportedFileTypeMetaData> = new Map([
  [
    SupportedFileType.Json,
    {
      extension: ['.json'],
      mimeTypes: ['application/json']
    }
  ],
  [
    SupportedFileType.Yaml,
    {
      extension: ['.yaml', '.yml'],
      mimeTypes: ['application/x-yaml', 'text/yaml', 'text/x-yaml', 'application/yaml']
    }
  ]
]);

export namespace FileTypeUtil {
  export const supportedFileExtensions = (fileTypes: SupportedFileType[]): string[] =>
    fileTypes.flatMap(fileType => SUPPORTED_FILE_TYPE_METADATA_MAP.get(fileType)?.extension ?? []);

  export const supportedFileExtensionsSet = (fileTypes: SupportedFileType[]): Set<string> =>
    new Set(supportedFileExtensions(fileTypes));

  export const supportedFileMimeTypes = (fileTypes: SupportedFileType[]): string[] =>
    fileTypes.flatMap(fileType => SUPPORTED_FILE_TYPE_METADATA_MAP.get(fileType)?.mimeTypes ?? []);

  export const supportedFileMimeTypesSet = (fileTypes: SupportedFileType[]): Set<string> =>
    new Set(supportedFileMimeTypes(fileTypes));
}

export interface SupportedFileTypeMetaData {
  extension: string[];
  mimeTypes: string[];
}
