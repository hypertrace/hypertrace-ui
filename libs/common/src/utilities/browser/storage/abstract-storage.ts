import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';

// A small abstraction on browser's storage for mocking and cleaning up the API a bit
export abstract class AbstractStorage {
  private readonly changeSubject: Subject<string> = new Subject();
  public constructor(private readonly storage: Storage) {}

  public contains(key: string): boolean {
    return this.storage.getItem(key) !== null;
  }

  public get<T extends string = string>(key: string): T | undefined {
    const value = this.storage.getItem(key);

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
    this.storage.setItem(key, value);
    this.changeSubject.next(key);
  }

  public delete(key: string): void {
    this.storage.removeItem(key);
    this.changeSubject.next(key);
  }
}
