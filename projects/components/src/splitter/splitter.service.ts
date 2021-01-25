import { Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { map, mergeMap, takeUntil } from 'rxjs/operators';
import { SplitterDirection } from './splitter';

@Injectable()
export class SplitterService {
  public buildSplitterLayoutChangeObservable(
    splitterElement: HTMLElement,
    parentElement: HTMLElement,
    direction: SplitterDirection
  ): Observable<boolean> {
    const moveOnParent$ = fromEvent<MouseEvent>(parentElement, 'mousemove');
    const downOnHost$ = fromEvent<MouseEvent>(splitterElement, 'mousedown');
    const upOnWindow$ = fromEvent<MouseEvent>(window, 'mouseup');

    return downOnHost$.pipe(
      mergeMap(() => moveOnParent$.pipe(takeUntil(upOnWindow$))),
      map(event => {
        const parentBounds = parentElement.getBoundingClientRect();
        const prevSibling = this.getHTMLElement(splitterElement.previousElementSibling);
        const nextSibling = this.getHTMLElement(splitterElement.nextElementSibling);

        const previousElementUpdatedDimension = prevSibling
          ? this.calculateUpdatedDimensionForPreviousElement(event, parentBounds, direction)
          : 0;

        const nextElementUpdatedDimension = nextSibling
          ? this.calculateUpdatedDimensionForNextElement(previousElementUpdatedDimension, parentBounds, direction)
          : 0;

        const updatedDimensionData: UpdatedDimensionData[] = [];

        if (prevSibling) {
          updatedDimensionData.push({
            element: prevSibling,
            dimension: previousElementUpdatedDimension
          });
        }

        if (nextSibling) {
          updatedDimensionData.push({
            element: nextSibling,
            dimension: nextElementUpdatedDimension
          });
        }

        return updatedDimensionData;
      }),
      map(data => this.maybeUpdateLayoutOfSiblings(data, direction))
    );
  }

  private maybeUpdateLayoutOfSiblings(data: UpdatedDimensionData[], direction: SplitterDirection): boolean {
    let layoutChanged = false;
    data.forEach(datum => {
      if (direction === SplitterDirection.Horizontal) {
        this.updateWidth(datum.element, datum.dimension);
      } else {
        this.updateHeight(datum.element, datum.dimension);
      }
      layoutChanged = true;
    });

    return layoutChanged;
  }

  private getHTMLElement(element: Element | null): HTMLElement | undefined {
    return element instanceof HTMLElement ? element : undefined;
  }

  private calculateUpdatedDimensionForPreviousElement(
    event: MouseEvent,
    parentBounds: DOMRect,
    direction: SplitterDirection
  ): number {
    return direction === SplitterDirection.Horizontal
      ? Math.min(event.clientX - parentBounds.x, parentBounds.width)
      : Math.min(event.clientY - parentBounds.y, parentBounds.height);
  }

  private calculateUpdatedDimensionForNextElement(
    previousElementUpdatedDimension: number,
    parentBounds: DOMRect,
    direction: SplitterDirection
  ): number {
    return (
      (direction === SplitterDirection.Horizontal ? parentBounds.width : parentBounds.height) -
      previousElementUpdatedDimension -
      4
    );
  }

  private updateWidth(element: HTMLElement, width: number): void {
    element.style.width = `${width}px`;
  }

  private updateHeight(element: HTMLElement, height: number): void {
    element.style.height = `${height}px`;
  }
}

interface UpdatedDimensionData {
  element: HTMLElement;
  dimension: number;
}
