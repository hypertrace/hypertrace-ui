import { Dictionary } from '../../types/types';

export class DictionaryStorageImpl implements Storage {
  private readonly data: Dictionary<string>;

  public static fromString(jsonString: string): DictionaryStorageImpl {
    return new DictionaryStorageImpl(JSON.parse(jsonString));
  }

  public constructor(data: Dictionary<string> = {}) {
    this.data = { ...data };
  }

  public get length(): number {
    return Object.keys(this.data).length;
  }

  public clear(): void {
    Object.keys(this.data).forEach(key => this.removeItem(key));
  }

  public getItem(key: string): string | null {
    // tslint:disable-next-line: no-null-keyword
    return this.data[key] ?? null;
  }

  public key(index: number): string | null {
    // tslint:disable-next-line: no-null-keyword
    return Object.keys(this.data)[index] ?? null;
  }

  public removeItem(key: string): void {
    // tslint:disable-next-line:no-dynamic-delete
    delete this.data[key];
  }

  public setItem(key: string, value: string): void {
    this.data[key] = value;
  }

  public toJsonString(): string {
    return JSON.stringify(this.data);
  }
}
