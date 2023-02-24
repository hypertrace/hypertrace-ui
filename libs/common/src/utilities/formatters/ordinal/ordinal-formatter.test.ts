import { OrdinalFormatter } from './ordinal-formatter';

describe('Ordinal formatter', () => {
  test('formats numbers correctly', () => {
    const formatter = new OrdinalFormatter();

    expect(formatter.format(1)).toEqual('1st');
    expect(formatter.format(2)).toEqual('2nd');
    expect(formatter.format(3)).toEqual('3rd');
    expect(formatter.format(4)).toEqual('4th');
    expect(formatter.format(5)).toEqual('5th');
    expect(formatter.format(6)).toEqual('6th');
    expect(formatter.format(7)).toEqual('7th');
    expect(formatter.format(8)).toEqual('8th');
    expect(formatter.format(9)).toEqual('9th');

    expect(formatter.format(10)).toEqual('10th');
    expect(formatter.format(11)).toEqual('11th');
    expect(formatter.format(12)).toEqual('12th');
    expect(formatter.format(13)).toEqual('13th');
    expect(formatter.format(14)).toEqual('14th');
    expect(formatter.format(15)).toEqual('15th');
    expect(formatter.format(16)).toEqual('16th');
    expect(formatter.format(17)).toEqual('17th');
    expect(formatter.format(18)).toEqual('18th');
    expect(formatter.format(19)).toEqual('19th');

    expect(formatter.format(20)).toEqual('20th');
    expect(formatter.format(21)).toEqual('21st');
    expect(formatter.format(22)).toEqual('22nd');
    expect(formatter.format(23)).toEqual('23rd');
    expect(formatter.format(24)).toEqual('24th');
    expect(formatter.format(25)).toEqual('25th');
    expect(formatter.format(26)).toEqual('26th');
    expect(formatter.format(27)).toEqual('27th');
    expect(formatter.format(28)).toEqual('28th');
    expect(formatter.format(29)).toEqual('29th');

    expect(formatter.format(130)).toEqual('130th');
    expect(formatter.format(131)).toEqual('131st');
    expect(formatter.format(132)).toEqual('132nd');
    expect(formatter.format(133)).toEqual('133rd');
    expect(formatter.format(134)).toEqual('134th');
    expect(formatter.format(135)).toEqual('135th');
    expect(formatter.format(136)).toEqual('136th');
    expect(formatter.format(137)).toEqual('137th');
    expect(formatter.format(138)).toEqual('138th');
    expect(formatter.format(139)).toEqual('139th');

    expect(formatter.format(1110)).toEqual('1110th');
    expect(formatter.format(1111)).toEqual('1111th');
    expect(formatter.format(1112)).toEqual('1112th');
    expect(formatter.format(1113)).toEqual('1113th');
    expect(formatter.format(1114)).toEqual('1114th');
    expect(formatter.format(1115)).toEqual('1115th');
    expect(formatter.format(1116)).toEqual('1116th');
    expect(formatter.format(1117)).toEqual('1117th');
    expect(formatter.format(1118)).toEqual('1118th');
    expect(formatter.format(1119)).toEqual('1119th');
  });
});
