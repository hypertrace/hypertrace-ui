import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GlobalHeaderHeightProviderService {
  protected headerHeight: string = '56px';

  public get globalHeaderHeight(): string {
    return this.headerHeight;
  }
}
