// To check if the the given regex is valid or not.
export const isValidRegex = (regex: string) => {
  try {
    // tslint:disable-next-line: no-unused-expression
    new RegExp(regex);
  } catch (e) {
    return false;
  }

  return true;
};
