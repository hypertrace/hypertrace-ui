export const enum KeyCode {
  Enter = 'Enter',
  Comma = ','
}

export const isEnterOrCommaKeyEvent = (event: KeyboardEvent): boolean =>
  event.key === KeyCode.Enter || event.key === KeyCode.Comma;
