import { SimpleChange, SimpleChanges } from '@angular/core';

/**
 * A typed version of Angular's `SimpleChange`
 */
export interface TypedSimpleChange<T> extends SimpleChange {
  /**
   * Value before this change
   */
  previousValue: T;
  /**
   * Current value (after this change)
   */
  currentValue: T;
}

export type KnownLifecycleKeys = 'ngOnInit' | 'ngOnChanges' | 'ngOnDestroy' | 'ngAfterViewInit';

/**
 * A typed version of Angular's `SimpleChanges`.
 */
export type TypedSimpleChanges<T> = SimpleChanges &
  {
    readonly [P in keyof T]?: TypedSimpleChange<T[P]>;
  };
