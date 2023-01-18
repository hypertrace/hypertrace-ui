import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Pipe({
  name: 'htAsFormGroup'
})
export class AsFormGroupPipe implements PipeTransform {
  public transform(value: AbstractControl | undefined): FormGroup | undefined {
    return value instanceof FormGroup ? value : undefined;
  }
}
