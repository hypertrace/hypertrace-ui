import { Injectable, Optional } from '@angular/core';
import { Observable } from 'rxjs';
import { AbstractStorage, ScopedStorageConfiguration } from './abstract-storage';

@Injectable({ providedIn: 'root' })
export class LocalStorage extends AbstractStorage {
  public constructor(@Optional() scopeConfig$?: Observable<ScopedStorageConfiguration>) {
    super(localStorage, scopeConfig$);
  }
}
