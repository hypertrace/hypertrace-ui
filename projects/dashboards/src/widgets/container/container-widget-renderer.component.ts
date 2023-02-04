import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Renderer2,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { Renderer } from '@hypertrace/hyperdash';
import { RendererApi, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { Observable, of } from 'rxjs';
import { WidgetRenderer } from '../widget-renderer';
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
export class ContainerWidgetRendererComponent extends WidgetRenderer<ContainerWidgetModel> implements AfterViewInit {
  @ViewChild('containerContent', { read: ViewContainerRef, static: true })
  public container!: ViewContainerRef;

  constructor(
    @Inject(RENDERER_API) api: RendererApi<ContainerWidgetModel>,
    changeDetector: ChangeDetectorRef,
    private readonly elRef: ElementRef,
    private readonly renderer: Renderer2
  ) {
    super(api, changeDetector);
  }

  public ngAfterViewInit(): void {
    this.model.layout.draw(this.container, this.model.children);
    this.setHostStyling();
  }

  protected fetchData(): Observable<object[]> {
    return of(this.model.children);
  }

  private setHostStyling(): void {
    const styles = this.model.stylerProperties?.getStyleProperties();
    if (styles) {
      for (const [key, value] of Object.entries(styles)) {
        this.renderer.setStyle(this.elRef.nativeElement, key, value);
      }
    }
  }
}
