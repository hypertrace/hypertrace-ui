import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { ReplayObservable } from '../../rxjs/rxjs-utils';
@Injectable({ providedIn: 'root' })
export class CookieService {
  private readonly cookie$: ReplaySubject<Map<string, string>> = new ReplaySubject(1);

  public constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  public getCookieChanges(): ReplayObservable<Map<string, string>> {
    return this.cookie$.asObservable();
  }

  public get(key: string): string | undefined {
    return this.getAll().get(key);
  }

  public set(key: string, value: string, msUntilExpire?: number): void {
    let expires = '';

    if (msUntilExpire !== undefined) {
      const date = new Date();
      date.setTime(date.getTime() + msUntilExpire);
      expires = `; expires=${date.toUTCString()}`;
    }
    this.document.cookie = `${key}=${encodeURIComponent(value)}${expires}`;

    this.cookie$.next(this.getAll());
  }

  public delete(key: string): void {
    this.set(key, '', -1);
  }

  public getAll(): Map<string, string> {
    return new Map(
      this.document.cookie
        .split(';')
        .map(keyValue => [
          keyValue.substring(0, keyValue.indexOf('=')).trim(),
          decodeURIComponent(keyValue.substring(keyValue.indexOf('=') + 1).trim())
        ])
    );
  }
}
