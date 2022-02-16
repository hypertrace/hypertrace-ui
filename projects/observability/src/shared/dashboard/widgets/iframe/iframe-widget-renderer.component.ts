import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { WidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { RendererApi, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { EMPTY, Observable } from 'rxjs';

import { IFrameWidgetModel } from './iframe-widget.model';

@Renderer({ modelClass: IFrameWidgetModel })
@Component({
  selector: 'ht-iframe-widget-renderer',
  template: ` <iframe width="100%" height="100%" frameBorder="0" [src]="urlSafe"></iframe> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./iframe-widget-renderer.component.scss']
})
export class IframeWidgetRendererComponent extends WidgetRenderer<IFrameWidgetModel> implements OnInit {
  public urlSafe?: SafeResourceUrl;

  public constructor(
    public sanitizer: DomSanitizer,
    @Inject(RENDERER_API) api: RendererApi<IFrameWidgetModel>,
    changeDetector: ChangeDetectorRef
  ) {
    super(api, changeDetector);
  }
  public ngOnInit(): void {
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.model.source);
  }
  protected fetchData(): Observable<unknown> {
    return EMPTY;
  }
}
