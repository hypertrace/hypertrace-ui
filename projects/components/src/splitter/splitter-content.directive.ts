import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[htSplitterContent]',
})
export class SplitterContentDirective {
  @Input('htSplitterContent')
  public dimension: SplitterCellDimension = { value: 1, unit: 'FR' };

  public constructor(public readonly templateRef: TemplateRef<unknown>) {}
}

export interface SplitterCellDimension {
  value: number;
  unit: 'PX' | 'FR';
}
