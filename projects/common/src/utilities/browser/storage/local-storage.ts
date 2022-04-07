import { Injectable, Optional } from '@angular/core';
import { AbstractStorage, ScopedStorageConfiguration } from './abstract-storage';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LocalStorage extends AbstractStorage {
  public constructor(@Optional() scopeConfig$?: Observable<ScopedStorageConfiguration>) {
    super(localStorage, scopeConfig$);
  }
}
