import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'htMemoize'
})
export class MemoizePipe implements PipeTransform {
  // tslint:disable-next-line: no-any any required for template type check
  public transform<TFunction extends (this: undefined, ...args: any[]) => unknown>(
    func: TFunction,
    ...args: Parameters<TFunction>
  ): ReturnType<TFunction> {
    return func.apply(undefined, args) as ReturnType<TFunction>;
  }
}
