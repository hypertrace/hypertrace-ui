export const durationFormatter = (duration?: number): string => {
  if (duration === undefined) {
    return '-';
  }

  const hours = new Date(duration).getUTCHours();
  const minutes = new Date(duration).getUTCMinutes();
  const seconds = new Date(duration).getUTCSeconds();
  const milliseconds = new Date(duration).getUTCMilliseconds();

  if (hours !== 0) {
    return `${hours}h ${doubleDigit(minutes)}m`;
  }
  if (minutes !== 0) {
    return `${minutes}m ${doubleDigit(seconds)}s`;
  }
  if (seconds !== 0) {
    return `${seconds}s`;
  }

  return `${milliseconds}ms`;
};

const doubleDigit = (value: number): string => (value < 10 ? `0${value}` : `${value}`);
