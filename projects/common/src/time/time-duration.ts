import { parse, toSeconds } from 'iso8601-duration';
import { toString } from 'lodash-es';
import { assertUnreachable } from '../utilities/lang/lang-utils';
import { TimeUnit } from './time-unit.type';

export class TimeDuration {
  private readonly millis: number;
  private readonly militaryTime: Date;

  public constructor(public readonly value: number, public readonly unit: TimeUnit) {
    this.toUnitString(); // Fail if unrecognized TimeUnit
    this.millis = this.normalizeToMillis(isNaN(value) ? 0 : value, unit);
    this.militaryTime = this.buildMilitaryTime();
  }

  public toMillis(): number {
    return this.millis;
  }

  public toDate(): Date {
    return this.militaryTime;
  }

  public static parse(durationString: string): TimeDuration {
    return new TimeDuration(toSeconds(parse(durationString)), TimeUnit.Second);
  }

  public getAmountForUnit(unit: ConvertibleTimeUnit): number {
    return this.toMillis() / this.unitInMillis(unit);
  }

  public toIso8601DurationString(): string {
    return `PT${this.toMillis() / 1000}S`;
  }

  public toIso8601DurationStringMilitaryTime(): string {
    const timeObject = this.toTimeObject();

    let timeString = 'P';
    if (timeObject.years > 0) {
      timeString = timeString.concat(toString(timeObject.years), 'Y');
    }
    if (timeObject.months > 0) {
      timeString = timeString.concat(toString(timeObject.months), 'M');
    }
    if (timeObject.days > 0) {
      timeString = timeString.concat(toString(timeObject.days), 'D');
    }
    if (timeObject.hours > 0 || timeObject.minutes > 0 || timeObject.seconds > 0) {
      timeString = timeString.concat('T');
    }
    if (timeObject.hours > 0) {
      timeString = timeString.concat(toString(timeObject.hours), 'H');
    }
    if (timeObject.minutes > 0) {
      timeString = timeString.concat(toString(timeObject.minutes), 'M');
    }
    if (timeObject.seconds > 0) {
      timeString = timeString.concat(toString(timeObject.seconds), 'S');
    }

    return timeString;
  }

  private toTimeObject(): TimeObject {
    const unixDate = new Date(0);

    return {
      years: this.militaryTime.getUTCFullYear() - unixDate.getUTCFullYear(),
      months: this.militaryTime.getUTCMonth() - unixDate.getUTCMonth(),
      days: this.militaryTime.getUTCDate() - unixDate.getUTCDate(),
      hours: this.militaryTime.getUTCHours(),
      minutes: this.militaryTime.getUTCMinutes(),
      seconds: this.militaryTime.getUTCSeconds()
    };
  }

  public toMultiUnitString(
    smallestUnit: ConvertibleTimeUnit = TimeUnit.Second,
    displayZero: boolean = true,
    unitStringType: UnitStringType = UnitStringType.Short
  ): string {
    const mostSignificantPortion = this.getMostSignificantUnitOnly();
    const remainingMillis = this.millis - mostSignificantPortion.toMillis();
    if (mostSignificantPortion.getAmountForUnit(smallestUnit) < 1) {
      return displayZero ? new TimeDuration(0, smallestUnit).toFormattedString(unitStringType) : '';
    }
    if (mostSignificantPortion.unit === smallestUnit || remainingMillis === 0) {
      return mostSignificantPortion.toFormattedString(unitStringType);
    }

    const joiningStr = unitStringType === UnitStringType.Long ? ' ' : '';

    return [
      mostSignificantPortion.toFormattedString(unitStringType),
      new TimeDuration(remainingMillis, TimeUnit.Millisecond).toMultiUnitString(smallestUnit, false, unitStringType)
    ].join(joiningStr);
  }

  private toFormattedString(unitStringType: UnitStringType = UnitStringType.Short): string {
    return unitStringType === UnitStringType.Short ? this.toString() : this.toLongString();
  }

  public getMostSignificantUnitOnly(): TimeDuration {
    const orderedUnits: ConvertibleTimeUnit[] = [
      TimeUnit.Week,
      TimeUnit.Day,
      TimeUnit.Hour,
      TimeUnit.Minute,
      TimeUnit.Second,
      TimeUnit.Millisecond
    ];

    // tslint:disable-next-line: strict-boolean-expressions
    const firstApplicableUnit = orderedUnits.find(unit => this.getAmountForUnit(unit) >= 1) || TimeUnit.Millisecond;
    const amountForUnit = Math.floor(this.getAmountForUnit(firstApplicableUnit));

    return new TimeDuration(amountForUnit, firstApplicableUnit);
  }

  public toString(): string {
    return `${this.value}${this.unit}`;
  }

  public toRelativeString(): string {
    return `Last ${this.toLongString()}`;
  }

  public toLongString(): string {
    return `${this.value} ${this.value === 1 ? this.toUnitString() : `${this.toUnitString()}s`}`;
  }

  public equals(other: TimeDuration): boolean {
    return this.unit === other.unit && this.value === other.value;
  }

  private normalizeToMillis(value: number, unit: TimeUnit): number {
    switch (unit) {
      case TimeUnit.Year:
        const currentYear = new Date();
        const startYear = new Date(currentYear);
        startYear.setFullYear(startYear.getFullYear() - value);

        return currentYear.getTime() - startYear.getTime();
      case TimeUnit.Month:
        const currentMonth = new Date();
        const startMonth = new Date(currentMonth);
        startMonth.setMonth(startMonth.getMonth() - value);

        return currentMonth.getTime() - startMonth.getTime();
      case TimeUnit.Week:
      case TimeUnit.Day:
      case TimeUnit.Hour:
      case TimeUnit.Minute:
      case TimeUnit.Second:
      case TimeUnit.Millisecond:
        return value * this.unitInMillis(unit);
      default:
        return assertUnreachable(unit);
    }
  }

  private buildMilitaryTime(): Date {
    return new Date(this.millis);
  }

  private toUnitString(): string {
    switch (this.unit) {
      case TimeUnit.Year:
        return 'year';
      case TimeUnit.Month:
        return 'month';
      case TimeUnit.Week:
        return 'week';
      case TimeUnit.Day:
        return 'day';
      case TimeUnit.Hour:
        return 'hour';
      case TimeUnit.Minute:
        return 'minute';
      case TimeUnit.Second:
        return 'second';
      case TimeUnit.Millisecond:
        return 'millisecond';
      default:
        return assertUnreachable(this.unit);
    }
  }

  private unitInMillis(unit: ConvertibleTimeUnit): number {
    switch (unit) {
      case TimeUnit.Week:
        return 24 * 60 * 60 * 1000 * 7;
      case TimeUnit.Day:
        return 24 * 60 * 60 * 1000;
      case TimeUnit.Hour:
        return 60 * 60 * 1000;
      case TimeUnit.Minute:
        return 60 * 1000;
      case TimeUnit.Second:
        return 1000;
      case TimeUnit.Millisecond:
        return 1;
      default:
        return assertUnreachable(unit);
    }
  }
}

type ConvertibleTimeUnit =
  | TimeUnit.Week
  | TimeUnit.Day
  | TimeUnit.Hour
  | TimeUnit.Minute
  | TimeUnit.Second
  | TimeUnit.Millisecond;

export enum UnitStringType {
  Long = 'long',
  Short = 'short'
}

interface TimeObject {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
