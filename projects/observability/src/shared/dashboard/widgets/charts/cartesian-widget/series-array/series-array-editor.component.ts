import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { ButtonStyle } from '@hypertrace/components';

import { EditorApi, ModelJson, ModelPropertyEditor } from '@hypertrace/hyperdash';
import { EDITOR_API } from '@hypertrace/hyperdash-angular';

import { SERIES_ARRAY_TYPE } from './series-array-type';

@ModelPropertyEditor({ propertyType: SERIES_ARRAY_TYPE.type })
@Component({
  selector: 'ht-series-array-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <htc-label [label]="api.label"> </htc-label>
    <htc-button label="Add" icon="${IconType.Add}" display="${ButtonStyle.Solid}" (click)="addSeries()"> </htc-button>
    <div *ngFor="let series of currentSeries; index as index">
      <div style="display: flex; align-items: center;">
        <hda-model-json-editor [modelJson]="series" (modelJsonChange)="updateValue(series, $event)">
        </hda-model-json-editor>
        <htc-button
          label="Remove"
          icon="${IconType.Delete}"
          display="${ButtonStyle.Text}"
          (click)="removeSeries(index)"
        >
        </htc-button>
      </div>
    </div>
  `
})
export class SeriesArrayEditorComponent {
  public currentSeries: ModelJson[];

  public constructor(@Inject(EDITOR_API) public readonly api: EditorApi<ModelJson[]>) {
    // tslint:disable-next-line:strict-boolean-expressions
    this.currentSeries = api.value || [];
  }

  public removeSeries(index: number): void {
    this.currentSeries.splice(index, 1);

    this.propagateChange();
  }

  public addSeries(): void {
    this.currentSeries.push({
      type: 'series',
      name: `Series ${this.currentSeries.length + 1}`,
      color: 'orangered'
    });

    this.propagateChange();
  }

  public updateValue(oldValue: ModelJson, newValue: ModelJson): void {
    Object.assign(oldValue, newValue);
    this.propagateChange();
  }

  public propagateChange(): void {
    this.api.valueChange(this.currentSeries);
  }
}
