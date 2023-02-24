export const durationFormatter = (duration?: number): string => {
  const dayInMs: number = 1000 * 60 * 60 * 24;
  if (duration === undefined) {
    return '-';
  }
  const days = Math.abs(Math.trunc(duration / dayInMs));

  const date = new Date(duration);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  const milliseconds = date.getUTCMilliseconds();

  if (days !== 0) {
    return hours === 0 && minutes === 0 ? `${days}d` : `${days}d ${hours}h ${doubleDigit(minutes)}m`;
  }

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
