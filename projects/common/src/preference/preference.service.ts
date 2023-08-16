import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AbstractStorage } from '../utilities/browser/storage/abstract-storage';
import { InMemoryStorage } from '../utilities/browser/storage/in-memory-storage';
import { LocalStorage } from '../utilities/browser/storage/local-storage';
import { SessionStorage } from '../utilities/browser/storage/session-storage';
import { BooleanCoercer } from '../utilities/coercers/boolean-coercer';
import { NumberCoercer } from '../utilities/coercers/number-coercer';

export const enum StorageType {
  Local = 'local',
  Session = 'session',
  InMemory = 'in-memory'
}

@Injectable({
  providedIn: 'root'
})
export class PreferenceService {
  private static readonly DEFAULT_STORAGE_TYPE: StorageType = StorageType.Local;

  private static readonly PREFERENCE_STORAGE_NAMESPACE: string = 'preference';
  private static readonly SEPARATOR_CHAR: string = '.';
  private static readonly SEPARATOR_REGEX: RegExp = /\.(.+)/;
  private readonly numberCoercer: NumberCoercer = new NumberCoercer();
  private readonly booleanCoercer: BooleanCoercer = new BooleanCoercer();

  public constructor(
    private readonly localStorage: LocalStorage,
    private readonly sessionStorage: SessionStorage,
    private readonly inMemoryStorage: InMemoryStorage
  ) {}

  /**
   * Returns the current storage value if defined, else the default value. The observable
   * will continue to emit as the preference is updated, reverting to default value if the
   * preference becomes unset. If default value is not provided, the observable will
   * throw in the case the preference is unset.
   */
  public get<T extends PreferenceValue>(
    key: PreferenceKey,
    defaultValue?: T,
    type: StorageType = PreferenceService.DEFAULT_STORAGE_TYPE
  ): Observable<T> {
    return this.preferenceStorage(type)
      .watch(this.asStorageKey(key))
      .pipe(
        map(storedValue => this.fromStorageValue<T>(storedValue) ?? defaultValue),
        switchMap(value =>
          value === undefined
            ? throwError(Error(`No value found or default provided for preferenceKey: ${key}`))
            : of(value)
        )
      );
  }

  public getOnce<T extends PreferenceValue>(
    key: PreferenceKey,
    defaultValue: T,
    type: StorageType = PreferenceService.DEFAULT_STORAGE_TYPE
  ): T {
    const value = this.preferenceStorage(type).get(this.asStorageKey(key));

    return this.fromStorageValue<T>(value) ?? defaultValue;
  }

  public set(
    key: PreferenceKey,
    value: PreferenceValue,
    type: StorageType = PreferenceService.DEFAULT_STORAGE_TYPE
  ): void {
    const val = this.asStorageValue(value);
    this.preferenceStorage(type).set(this.asStorageKey(key), val);
  }

  public delete(key: PreferenceKey, type: StorageType = PreferenceService.DEFAULT_STORAGE_TYPE): void {
    this.preferenceStorage(type).delete(this.asStorageKey(key));
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

  private preferenceStorage(type: StorageType): AbstractStorage {
    switch (type) {
      case StorageType.Session:
        return this.sessionStorage;
      case StorageType.InMemory:
        return this.inMemoryStorage;
      case StorageType.Local:
      default:
        return this.localStorage;
    }
  }
}

type PreferenceStorageKey = string;
type PreferenceStorageValue = string;
export type PreferenceKey = string;
export type PreferenceValue = string | number | boolean | object;
