import { hashCode } from '../utilities/math/math-utilities';
import { rgb } from 'd3-color';

export const enum Color {
  Blue1 = '#f0f6ff',
  Blue2 = '#b8d3ff',
  Blue3 = '#70a7ff',
  Blue4 = '#2478ff',
  Blue6 = '#0043ad',
  Blue5 = '#0053d7',
  Blue7 = '#003385',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  BlueGray1 = '#70a7ff',
  BlueGray2 = '#648fd2',
  BlueGray3 = '#5777a4',
  BlueGray4 = '#4b5f77',
  BlueGray5 = '#3f474a',
  Cloud1 = '#edf4f9',
  Cloud2 = '#c7ddec',
  Cloud3 = '#a1c5e0',
  Gray1 = '#f4f5f5',
  Gray2 = '#e1e4e5',
  Gray3 = '#b7bfc2',
  Gray4 = '#889499',
  Gray5 = '#657277',
  Gray6 = '#40474a',
  Gray7 = '#272c2e',
  Gray8 = '#171a1c',
  Gray9 = '#080909',
  Green1 = '#f0fcf6',
  Green2 = '#c3f3db',
  Green3 = '#95eabe',
  Green4 = '#59de99',
  Green5 = '#27C675',
  Green6 = '#1f9e5c',
  Green7 = '#187746',
  Green8 = '#10512f',
  Green9 = '#03110a',
  Orange1 = '#FFF4EB',
  Orange3 = '#FDC088',
  Orange4 = '#fca555',
  Orange5 = '#fb8b24',
  Orange6 = '#bb5207',
  Purple1 = '#FCF4FD',
  Purple2 = '#f2d0f5',
  Purple3 = '#E295E9',
  Purple4 = '#CB41D8',
  Purple5 = '#94209f',
  Purple6 = '#791B82',
  Red1 = '#fff3f1',
  Red2 = '#fecac2',
  Red3 = '#FEA395',
  Red4 = '#fd7c68',
  Red5 = '#FD5138',
  Red6 = '#e51f01',
  Red7 = '#bb1902',
  Red8 = '#6a0e01',
  Red9 = '#140300',
  Turquoise1 = '#ecffff',
  Turquoise3 = '#48d1cc',
  Brown1 = '#9e4c41',
  White = '#FFFFFF',
  Yellow1 = '#fffbeb',
  Yellow2 = '#fff4c2',
  Yellow3 = '#ffed94',
  Yellow4 = '#FFE566',
  Yellow5 = '#ffdd3a',
  Yellow6 = '#facf00',
  Yellow7 = '#bd9d00',
  Yellow8 = '#6d5b00',
  Yellow9 = '#181400',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  Aurora = '#27C675',
  Teal = '#01BCD6',
  Transparent = 'transparent',
  OffWhite = '#f6f6f64d'
}

export interface ColorCombination {
  background: string;
  foreground: string;
}

export const getHexColorForString = (id: string): string => {
  const hash = hashCode(id);
  let rgbString = '#';
  for (let i = 0; i < 3; i++) {
    // eslint-disable-next-line  no-bitwise
    const value = (hash >> (i * 8)) & 0xff;
    rgbString += `00${value.toString(16)}`.substr(-2);
  }

  return rgbString;
};

export const getContrastColor = (
  rgbColorString: string,
  darkColor: string = Color.Gray9,
  lightColor: string = Color.White
): string => {
  // Convert to RGB value
  const rgbColor = rgb(rgbColorString);

  // Get YIQ ratio
  const yiq = (rgbColor.r * 299 + rgbColor.g * 587 + rgbColor.b * 114) / 1000;

  // Check contrast
  return yiq >= 128 ? darkColor : lightColor;
};
