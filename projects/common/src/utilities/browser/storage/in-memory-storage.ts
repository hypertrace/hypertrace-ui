import { Injectable } from '@angular/core';
import { AbstractStorage } from './abstract-storage';

@Injectable({ providedIn: 'root' })
export class InMemoryStorage extends AbstractStorage {
  public constructor() {
    super(
      new (class {
        private readonly data: Map<string, string> = new Map();

        public get length(): number {
          return this.data.size;
        }

        public clear(): void {
          this.data.clear();
        }

        public getItem(key: string): string | null {
          // tslint:disable-next-line: no-null-keyword
          return this.data.get(key) ?? null;
        }

        public key(index: number): string | null {
          // tslint:disable-next-line: no-null-keyword
          return Array.from(this.data.keys())[index] ?? null;
        }

        public removeItem(key: string): void {
          this.data.delete(key);
        }

        public setItem(key: string, value: string): void {
          this.data.set(key, value);
        }
      })()
    );
  }
}
