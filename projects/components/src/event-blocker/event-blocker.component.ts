import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  IterableDiffer,
  IterableDiffers,
  OnChanges,
  Renderer2
} from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { isEmpty } from 'lodash-es';

@Component({
  selector: 'htc-event-blocker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <ng-content> </ng-content> `
})
export class EventBlockerComponent implements OnChanges {
  @Input()
  public enabled: boolean = true;

  @Input()
  public events: string[] = [];

  // Shortcut syntax if listening to single event
  @Input()
  public event?: string;

  private readonly eventUnbindFnMap: Map<string, () => void> = new Map();
  private readonly differ: IterableDiffer<string>;

  public constructor(
    private readonly renderer: Renderer2,
    private readonly host: ElementRef,
    differFactory: IterableDiffers
  ) {
    this.differ = differFactory.find(this.events).create();
  }

  public ngOnChanges(changeObject: TypedSimpleChanges<this>): void {
    if (changeObject.events || changeObject.event) {
      const singleEventArray = isEmpty(this.event) ? [] : [this.event!];
      const allEvents = [...this.events, ...singleEventArray];
      const diff = this.differ.diff(allEvents);
      if (!diff) {
        return;
      }
      diff.forEachAddedItem(({ item }) => this.addListener(item));
      diff.forEachRemovedItem(({ item }) => this.removeListener(item));
    }
  }

  public removeListener(eventName: string): void {
    if (this.eventUnbindFnMap.has(eventName)) {
      this.eventUnbindFnMap.get(eventName)!();
      this.eventUnbindFnMap.delete(eventName);
    }
  }

  public addListener(eventName: string): void {
    if (this.eventUnbindFnMap.has(eventName)) {
      return;
    }

    const unbindFn = this.renderer.listen(this.host.nativeElement, eventName, event => this.blockEventIfNeeded(event));

    this.eventUnbindFnMap.set(eventName, unbindFn);
  }

  private blockEventIfNeeded(event: Event): void {
    if (this.enabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
