export const durationFormatter = (duration?: number): string => {
  if (duration === undefined) {
    return '-';
  }

  const hours = new Date(duration).getUTCHours();
  const minutes = new Date(duration).getUTCMinutes();
  const seconds = new Date(duration).getUTCSeconds();
  const milliseconds = new Date(duration).getUTCMilliseconds();

  if (hours !== 0) {
    return `${hours}:${doubleDigit(minutes)}:${doubleDigit(seconds)}.${tripleDigit(milliseconds)}`;
  }
  if (minutes !== 0) {
    return `${minutes}:${doubleDigit(seconds)}.${tripleDigit(milliseconds)}`;
  }
  if (seconds !== 0) {
    return `${seconds}.${tripleDigit(milliseconds)}`;
  }

  return `${milliseconds}`;
};

const doubleDigit = (value: number): string => (value < 10 ? `0${value}` : `${value}`);
const tripleDigit = (value: number): string => {
  if (value < 10) {
    return `00${value}`;
  }
  if (value < 100) {
    return `0${value}`;
  }

  return `${value}`;
};
