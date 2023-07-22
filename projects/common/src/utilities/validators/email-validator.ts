export const isEmailAddressValid = (emailAddress: string) => {
  // Regex as per W3C spec for email field
  // Source: https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
  const regex: RegExp = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return regex.test(emailAddress);
};

export const areEmailAddressesValid = (emailAddresses: string[]) =>
  emailAddresses.filter(emailAddress => !isEmailAddressValid(emailAddress)).length === 0;
