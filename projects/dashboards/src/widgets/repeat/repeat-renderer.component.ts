import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild, ViewContainerRef } from '@angular/core';
import { Renderer } from '@hypertrace/hyperdash';
import { EMPTY, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WidgetRenderer } from '../widget-renderer';
import { RepeatModel } from './repeat.model';

@Renderer({ modelClass: RepeatModel })
@Component({
  selector: 'ht-repeat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <div #repeaterContent></div> `
})
export class RepeatRendererComponent extends WidgetRenderer<RepeatModel> implements AfterViewInit {
  @ViewChild('repeaterContent', { read: ViewContainerRef, static: true })
  public container?: ViewContainerRef;

  public ngAfterViewInit(): void {
    this.fetchData();
  }

  protected fetchData(): Observable<unknown> {
    if (!this.container) {
      return EMPTY;
    }
    const data$ = this.model.getChildren().pipe(takeUntil(this.destroyed$));

    data$.subscribe(children => {
      this.model.layout.draw(this.container!, children);
    });

    return data$;
  }
}
