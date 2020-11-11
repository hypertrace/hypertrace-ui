import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild, ViewContainerRef } from '@angular/core';
import { Renderer } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WidgetRenderer } from '../widget-renderer';
import { ConditionalContainerWidgetModel } from './conditional-container-widget.model';
import { ContainerWidgetModel } from './container-widget.model';

@Renderer({ modelClass: ContainerWidgetModel })
@Component({
  selector: 'ht-container-widget',
  styleUrls: ['./container-widget-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ht-container-widget">
      <ht-label *ngIf="this.model.title" [label]="this.model.title | htDisplayTitle" class="title"></ht-label>
      <div class="content" [ngClass]="{ 'with-title': this.model.title }">
        <div #containerContent></div>
      </div>
    </div>
  `
})
export class ContainerWidgetRendererComponent
  extends WidgetRenderer<ContainerWidgetModel | ConditionalContainerWidgetModel>
  implements AfterViewInit {
  @ViewChild('containerContent', { read: ViewContainerRef, static: true })
  public container!: ViewContainerRef;

  public ngAfterViewInit(): void {
    this.fetchData().subscribe(children => this.model.layout.draw(this.container, children));
  }

  protected fetchData(): Observable<object[]> {
    return this.model.getChildren().pipe(takeUntil(this.destroyed$));
  }
}
