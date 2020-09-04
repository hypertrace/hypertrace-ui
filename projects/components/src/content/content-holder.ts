import { Directive, TemplateRef, ViewChild } from '@angular/core';

export const CONTENT_HOLDER_TEMPLATE = `
  <ng-template #contentHolder>
    <ng-content></ng-content>
  </ng-template>
`;

@Directive()
// tslint:disable-next-line: directive-class-suffix
export abstract class ContentHolder {
  @ViewChild('contentHolder', { static: true })
  public content!: TemplateRef<unknown>;
}
