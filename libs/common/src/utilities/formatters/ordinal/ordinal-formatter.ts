export class OrdinalFormatter {
  private static readonly ordinals: string[] = ['th', 'st', 'nd', 'rd'];

  public format(value: number): string {
    const positionMod100 = value % 100;
    const positionMod10 = positionMod100 % 10;

    const ordinals = OrdinalFormatter.ordinals;

    if (positionMod100 > 10 && positionMod100 < 20) {
      /**
       * 11th, 12th, 13th, 14th, 15th, 16th, 17th, 18th, 19th
       */
      return `${value}${ordinals[0]}`;
    }

    if (positionMod10 >= 0 && positionMod10 < ordinals.length) {
      /**
       * 0th, 1st, 2nd, 3rd
       * 20th, 21st, 22nd, 23rd
       * 30th, 31st, 32nd, 33rd
       */
      return `${value}${ordinals[positionMod10]}`;
    }

    /**
     * All other numbers would be suffixed with th
     */
    return `${value}${ordinals[0]}`;
  }
}
