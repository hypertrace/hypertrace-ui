import { AbstractControl } from '@angular/forms';
import { getStringsFromCommaSeparatedList } from '../formatters/string/string-formatter';
import { areEmailAddressesValid } from './email-validator';

export namespace CustomFormValidators {
  export const commaSeparatedEmails = (control: AbstractControl) => {
    const emails = getStringsFromCommaSeparatedList(control.value);

    // tslint:disable: no-null-keyword
    return !areEmailAddressesValid(emails) ? { invalidEmails: true } : null;
  };
}
