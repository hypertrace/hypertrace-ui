import { FormControl, FormGroup } from '@angular/forms';
import { AsFormGroupPipe } from '@hypertrace/common';

describe('AsFormGroupPipe', () => {
  const pipe = new AsFormGroupPipe();

  test('should output a form group on the happy path', () => {
    const formGroup = new FormGroup({});
    const result = pipe.transform(formGroup);
    expect(result).toEqual(formGroup);
  });

  test('should not output a form control', () => {
    const formControl = new FormControl('');
    const result = pipe.transform(formControl);
    expect(result).toBeUndefined();
  });

  test('should work with nested form groups', () => {
    const childForm = new FormGroup({});
    const parentForm = new FormGroup({ childForm: childForm });
    const result = pipe.transform(parentForm.controls.childForm);
    expect(result).toEqual(childForm);
  });
});
