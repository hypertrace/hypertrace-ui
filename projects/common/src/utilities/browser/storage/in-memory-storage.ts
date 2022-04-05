import { Injectable } from '@angular/core';
import { AbstractStorage } from './abstract-storage';
import { DictionaryStorageImpl } from './dictionary-storage-impl';

@Injectable({ providedIn: 'root' })
export class InMemoryStorage extends AbstractStorage {
  public constructor() {
    super(new DictionaryStorageImpl());
  }
}
