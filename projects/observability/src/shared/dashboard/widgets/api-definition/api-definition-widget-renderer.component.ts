import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { InteractiveDataWidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { RendererApi, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { ApiDefinitionWidgetModel } from './api-definition-widget.model';
import { ApiDefinitionData } from './data/api-definition-data-source.model';

@Renderer({ modelClass: ApiDefinitionWidgetModel })
@Component({
  selector: 'ht-api-definition-widget-renderer',
  styleUrls: ['./api-definition-widget-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ht-api-definition-widget fill-container" *htcLoadAsync="this.data$ as data">
      <div class="header">
        <htc-label class="uri" label="URI"></htc-label>
        <div class="value">
          <span>{{ data.uri }}</span>
        </div>
      </div>
      <div class="toggle-button">
        <htc-toggle-button-group [(selectedLabel)]="this.selectedView">
          <htc-toggle-button [label]="this.request"></htc-toggle-button>
          <htc-toggle-button [label]="this.response"></htc-toggle-button>
        </htc-toggle-button-group>
      </div>
      <div class="details">
        <ht-api-definition-request
          class="request"
          *ngIf="this.selectedView === this.request"
          [params]="data.params"
          [bodySchema]="data.requestBodySchema"
        ></ht-api-definition-request>

        <ht-api-definition-response
          class="response"
          *ngIf="this.selectedView === this.response"
          [bodySchema]="data.responseBodySchema"
        ></ht-api-definition-response>
      </div>
    </div>
  `
})
export class ApiDefinitionWidgetRendererComponent
  extends InteractiveDataWidgetRenderer<ApiDefinitionWidgetModel, ApiDefinitionData>
  implements OnInit {
  public readonly request: string = 'Request';
  public readonly response: string = 'Response';

  public selectedView: string = this.request;

  public constructor(
    @Inject(RENDERER_API) api: RendererApi<ApiDefinitionWidgetModel>,
    changeDetector: ChangeDetectorRef
  ) {
    super(api, changeDetector);
  }

  protected fetchData(): Observable<ApiDefinitionData> {
    return this.buildDataObservable();
  }

  protected buildDataObservable(): Observable<ApiDefinitionData> {
    return this.model.getData();
  }
}
