export const sortUnknown = (a: unknown, b: unknown) => {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  return String(a).localeCompare(String(b));
};

export const getDifferenceInDays = (timeParamValue: string | undefined): number | undefined => {
  if (timeParamValue !== undefined) {
    const timeRangeArray = /(\d+)-(\d+)/.exec(timeParamValue);
    const currentDate = new Date();
    const searchStartDate = new Date(+timeRangeArray![1]);

    return currentDate.getDate() - searchStartDate.getDate();
  }

  return timeParamValue;
};
