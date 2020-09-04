import { Injectable } from '@angular/core';
import { AbstractStorage } from './abstract-storage';

@Injectable({ providedIn: 'root' })
export class LocalStorage extends AbstractStorage {
  public constructor() {
    super(localStorage);
  }
}
