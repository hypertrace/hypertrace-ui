import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild, ViewContainerRef } from '@angular/core';
import { Renderer } from '@hypertrace/hyperdash';
import { Observable, of } from 'rxjs';
import { WidgetRenderer } from '../widget-renderer';
import { ContainerWidgetModel } from './container-widget.model';

@Renderer({ modelClass: ContainerWidgetModel })
@Component({
  selector: 'htc-container-widget',
  styleUrls: ['./container-widget-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="htc-container-widget">
      <htc-label *ngIf="this.model.title" [label]="this.model.title | htcDisplayTitle" class="title"></htc-label>
      <div #containerContent></div>
    </div>
  `
})
export class ContainerWidgetRendererComponent extends WidgetRenderer<ContainerWidgetModel> implements AfterViewInit {
  @ViewChild('containerContent', { read: ViewContainerRef, static: true })
  public container!: ViewContainerRef;

  public ngAfterViewInit(): void {
    this.model.layout.draw(this.container, this.model.children);
  }

  protected fetchData(): Observable<object[]> {
    return of(this.model.children);
  }
}
