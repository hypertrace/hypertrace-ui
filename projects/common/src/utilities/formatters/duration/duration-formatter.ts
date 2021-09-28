export const enum DurationDisplayMode {
  DaysOnly,
  DaysAndHours,
  DaysHoursAndMinutes,
  DaysHoursMinutesAndSeconds,
  DaysHoursMinutesSecondsAndMilliseconds
}

export const enum DurationDisplayTextType {
  Full,
  Short
}

export interface DurationFormatOptions {
  mode: DurationDisplayMode;
  textType: DurationDisplayTextType;
}

export const defaultDurationFormatOptions: DurationFormatOptions = {
  mode: DurationDisplayMode.DaysHoursMinutesAndSeconds,
  textType: DurationDisplayTextType.Short // Example short -> 6d 5h   full -> 6 days 5 hours
};

export const durationFormatter = (duration: number, options: DurationFormatOptions): string => {
  const dayInMs: number = 1000 * 60 * 60 * 24;
  const date = new Date(duration);

  const durationData: DurationData = {
    days: Math.abs(Math.trunc(duration / dayInMs)),
    hours: date.getUTCHours(),
    minutes: date.getUTCMinutes(),
    seconds: date.getUTCSeconds(),
    milliseconds: date.getUTCMilliseconds()
  };

  return durationString(durationData, options).trim();
};

interface DurationData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

const durationString = (data: DurationData, options: DurationFormatOptions): string => {
  const showFullText: boolean = options.textType === DurationDisplayTextType.Full;
  const suffixes = showFullText
    ? [' days', ' hours', ' minutes', ' seconds', ' milliseconds']
    : ['d', 'h', 'm', 's', 'ms'];

  switch (options.mode) {
    case DurationDisplayMode.DaysOnly:
      return `${data.days}${suffixes[0]}`;
    case DurationDisplayMode.DaysAndHours:
      return `${displayString(data.days, suffixes[0])} ${data.hours}${suffixes[1]}`;
    case DurationDisplayMode.DaysHoursAndMinutes:
      return `${displayString(data.days, suffixes[0])} ${displayString(data.hours, suffixes[1])} ${doubleDigit(
        data.minutes
      )}${suffixes[2]}`;
    case DurationDisplayMode.DaysHoursMinutesAndSeconds:
      return `${displayString(data.days, suffixes[0])} ${displayString(data.hours, suffixes[1])} ${displayString(
        data.minutes,
        suffixes[2]
      )} ${doubleDigit(data.seconds)}${suffixes[3]}`;
    case DurationDisplayMode.DaysHoursMinutesSecondsAndMilliseconds:
      return `${displayString(data.days, suffixes[0])} ${displayString(data.hours, suffixes[1])} ${displayString(
        data.minutes,
        suffixes[2]
      )} ${displayString(data.seconds, suffixes[3])} ${data.milliseconds}${suffixes[4]}`;
    default:
      return '-';
  }
};

const displayString = (value: number, suffix: string): string => (value === 0 ? '' : `${value}${suffix}`);

const doubleDigit = (value: number): string => (value < 10 ? `0${value}` : `${value}`);
