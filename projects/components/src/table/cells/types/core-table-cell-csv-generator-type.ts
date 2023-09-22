export const enum CoreTableCellCsvGeneratorType {
  Boolean = 'boolean',
  Number = 'number',
  String = 'string',
  StringArray = 'string-array',
  Timestamp = 'timestamp',
  // Skip to be used by cells that are not to be included in CSV
  Skip = 'skip'
}
