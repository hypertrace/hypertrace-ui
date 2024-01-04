import { KeyCode } from '../key-codes/key-code';

export const checkIfKeyEvent = (event: KeyboardEvent, key: KeyCode): boolean => event.key === key;
export const isEnterKeyEvent = (event: KeyboardEvent): boolean => checkIfKeyEvent(event, KeyCode.Enter);
export const isEnterOrCommaKeyEvent = (event: KeyboardEvent): boolean =>
  checkIfKeyEvent(event, KeyCode.Enter) || checkIfKeyEvent(event, KeyCode.Comma);
export const getStringFromPasteEvent = (event: ClipboardEvent): string =>
  event.clipboardData?.getData('text/plain') ?? '';
