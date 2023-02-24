import { FormControl } from '@angular/forms';
import { CustomFormValidators } from '@hypertrace/common';

// tslint:disable: no-null-keyword
describe('CustomFormValidators', () => {
  test('commaSeparatedEmails should return null when emails are correct', () => {
    const emails = new FormControl('test-email@test.ai, test.email@test.ai');
    expect(CustomFormValidators.commaSeparatedEmails(emails)).toEqual(null);

    emails.setValue('test-email@test.ai');
    expect(CustomFormValidators.commaSeparatedEmails(emails)).toEqual(null);
  });

  test('commaSeparatedEmails should return correct object when emails are incorrect', () => {
    const emails = new FormControl('test-email, test.email@test.ai');
    expect(CustomFormValidators.commaSeparatedEmails(emails)).toEqual(expect.objectContaining({ invalidEmails: true }));

    emails.setValue('test-email');
    expect(CustomFormValidators.commaSeparatedEmails(emails)).toEqual(expect.objectContaining({ invalidEmails: true }));
  });
});
