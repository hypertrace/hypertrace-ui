import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';
import { DictionaryStorageImpl } from './dictionary-storage-impl';

// A small abstraction on browser's storage for mocking and cleaning up the API a bit
export abstract class AbstractStorage {
  private readonly changeSubject: Subject<string> = new Subject();
  private readonly scopedStorage?: DictionaryStorageImpl;

  public constructor(private readonly storage: Storage, private readonly scopeConfig?: ScopedStorageConfiguration) {
    if (scopeConfig) {
      this.scopedStorage = DictionaryStorageImpl.fromString(storage.getItem(scopeConfig.scopeKey) ?? '{}');
    }
  }

  public contains(key: string): boolean {
    return this.get(key) !== undefined;
  }

  public get<T extends string = string>(key: string): T | undefined {
    const value =
      this.scopeConfig && !this.scopeConfig.fallbackPolicy
        ? this.scopedStorage!.getItem(key) // Only read from scoped storage if in use AND no fallback policy
        : this.scopedStorage?.getItem(key) ?? this.storage.getItem(key);

    if (
      this.scopeConfig?.fallbackPolicy === 'read-and-migrate' &&
      value !== null &&
      this.scopedStorage?.getItem(key) === null
    ) {
      this.set(key, value);
      this.storage.removeItem(key);
    }

    return value !== null ? (value as T) : undefined;
  }

  public watch<T extends string = string>(key: string): Observable<T | undefined> {
    return this.changeSubject.pipe(
      filter(changedKey => changedKey === key),
      map(() => this.get<T>(key)),
      startWith(this.get<T>(key)),
      distinctUntilChanged()
    );
  }

  public set(key: string, value: string): void {
    (this.scopedStorage ?? this.storage).setItem(key, value);
    this.flushAnyScopedStorage();
    this.changeSubject.next(key);
  }

  public delete(key: string): void {
    (this.scopedStorage ?? this.storage).removeItem(key);
    this.flushAnyScopedStorage();
    this.changeSubject.next(key);
  }

  private flushAnyScopedStorage(): void {
    if (this.scopedStorage && this.scopeConfig?.scopeKey) {
      this.storage.setItem(this.scopeConfig.scopeKey, this.scopedStorage?.toJsonString());
    }
  }
}

export interface ScopedStorageConfiguration {
  scopeKey: string;
  fallbackPolicy?: 'read-only' | 'read-and-migrate';
}
