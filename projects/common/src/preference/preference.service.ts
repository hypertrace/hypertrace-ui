import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { LocalStorage } from '../utilities/browser/storage/local-storage';
import { BooleanCoercer } from '../utilities/coercers/boolean-coercer';
import { NumberCoercer } from '../utilities/coercers/number-coercer';

@Injectable({
  providedIn: 'root'
})
export class PreferenceService {
  private static readonly PREFERENCE_STORAGE_NAMESPACE: string = 'preference';
  private static readonly SEPARATOR_CHAR: string = '.';
  private static readonly SEPARATOR_REGEX: RegExp = /\.(.+)/;
  private readonly numberCoercer: NumberCoercer = new NumberCoercer();
  private readonly booleanCoercer: BooleanCoercer = new BooleanCoercer();

  public constructor(private readonly preferenceStorage: LocalStorage) {}

  /**
   * Returns the current storage value if defined, else the default value. The observable
   * will continue to emit as the preference is updated, reverting to default value if the
   * preference becomes unset. If default value is not provided, the observable will
   * throw in the case the preference is unset.
   */
  public get<T extends PreferenceValue>(key: PreferenceKey, defaultValue?: T): Observable<T> {
    return this.preferenceStorage.watch(this.asStorageKey(key)).pipe(
      map(storedValue => this.fromStorageValue<T>(storedValue) ?? defaultValue),
      switchMap(value =>
        value === undefined
          ? throwError(Error(`No value found or default provided for preferenceKey: ${key}`))
          : of(value)
      )
    );
  }

  public set(key: PreferenceKey, value: PreferenceValue): void {
    const val = this.asStorageValue(value);
    this.preferenceStorage.set(this.asStorageKey(key), val);
  }

  private asStorageKey(key: PreferenceKey): PreferenceStorageKey {
    return `${PreferenceService.PREFERENCE_STORAGE_NAMESPACE}${PreferenceService.SEPARATOR_CHAR}${key}`;
  }

  private asStorageValue(value: PreferenceValue): PreferenceStorageValue {
    const valueType = typeof value;
    const storageValue = valueType === 'object' ? JSON.stringify(value) : String(value);

    return `${valueType}${PreferenceService.SEPARATOR_CHAR}${storageValue}`;
  }

  private fromStorageValue<T extends PreferenceValue>(value?: PreferenceStorageValue): T | undefined {
    if (value === undefined) {
      return undefined;
    }

    const [type, valueAsString] = value.split(PreferenceService.SEPARATOR_REGEX, 2);

    switch (type) {
      case 'string':
        return valueAsString as T;
      case 'number':
        return this.numberCoercer.coerce(valueAsString) as T;
      case 'boolean':
        return this.booleanCoercer.coerce(valueAsString) as T;
      case 'object':
        return JSON.parse(valueAsString) as T;
      default:
        return undefined;
    }
  }
}

type PreferenceStorageKey = string;
type PreferenceStorageValue = string;
export type PreferenceKey = string;
export type PreferenceValue = string | number | boolean | object;
