import { Injectable } from '@angular/core';
import { AbstractStorage } from './abstract-storage';

@Injectable({ providedIn: 'root' })
export class SessionStorage extends AbstractStorage {
  public constructor() {
    super(sessionStorage);
  }
}
