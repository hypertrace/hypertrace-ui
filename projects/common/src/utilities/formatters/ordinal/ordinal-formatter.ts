export class OrdinalFormatter {
  private static readonly ordinals: string[] = ['th', 'st', 'nd', 'rd'];

  public format(value: number): string {
    let position = value % 10;
    const ordinals = OrdinalFormatter.ordinals;
    return `${value}${position >= 0 && position < ordinals.length ? ordinals[position] : ordinals[0]}`;
  }
}
