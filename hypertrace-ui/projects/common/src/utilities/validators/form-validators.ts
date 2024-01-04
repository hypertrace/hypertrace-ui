import { AbstractControl } from '@angular/forms';
import { isEmpty, isNil } from 'lodash-es';
import { getStringsFromCommaSeparatedList } from '../formatters/string/string-formatter';
import { areEmailAddressesValid } from './email-validator';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CustomFormValidators {
  export const commaSeparatedEmails = (control: AbstractControl) => {
    if (isNil(control.value) || isEmpty(control.value)) {
      return null;
    }

    const emails = getStringsFromCommaSeparatedList(control.value);

    return !areEmailAddressesValid(emails) ? { invalidEmails: true } : null;
  };
}
