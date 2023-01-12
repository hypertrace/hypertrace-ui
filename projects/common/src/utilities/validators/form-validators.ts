import { AbstractControl } from '@angular/forms';
import { getStringsFromCommaSeparatedList } from '../formatters/string/string-formatter';
import { areEmailAddressesValid } from './email-validator';

export const validateCommaSeparatedEmails = (control: AbstractControl) => {
  const emails = getStringsFromCommaSeparatedList(control.value);

  // tslint:disable: no-null-keyword
  return control.value.length === 0
    ? { emptyEmails: true }
    : !areEmailAddressesValid(emails)
    ? { invalidEmails: true }
    : null;
};
