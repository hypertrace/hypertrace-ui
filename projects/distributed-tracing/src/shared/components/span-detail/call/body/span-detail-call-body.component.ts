import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Json } from '@hypertrace/common';
import { ToggleViewMode } from '@hypertrace/components';

@Component({
  selector: 'htc-span-detail-call-body',
  styleUrls: ['./span-detail-call-body.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="call-body">
      <htc-label label="Body" class="title"></htc-label>
      <div class="content">
        <div class="toggle-button">
          <htc-toggle-button-group [(selectedLabel)]="this.selectedTab" viewMode="${ToggleViewMode.Text}">
            <htc-toggle-button [label]="this.parsedLabel"></htc-toggle-button>
            <htc-toggle-button [label]="this.rawLabel"></htc-toggle-button>
          </htc-toggle-button-group>
        </div>

        <div class="body-viewer" [ngSwitch]="this.selectedTab">
          <section *ngSwitchCase="this.parsedLabel">
            <htc-json-viewer *ngIf="this.isParsable()" [json]="this.parsedBody"> </htc-json-viewer>
            <htc-message-display
              *ngIf="!this.isParsable()"
              [icon]="this.icon"
              [title]="this.title"
              [description]="this.description"
            >
            </htc-message-display>
          </section>
          <section *ngSwitchCase="this.rawLabel">
            <pre class="pre-body">{{ this.body | json }}</pre>
          </section>
        </div>
      </div>
    </div>
  `
})
export class SpanDetailCallBodyComponent implements OnChanges {
  public readonly parsedLabel: string = 'Parsed';
  public readonly rawLabel: string = 'Raw';
  public selectedTab: string = this.rawLabel;

  @Input()
  public body?: string;

  public parsedBody?: Json;

  public icon?: IconType;
  public title?: string;
  public description?: string;

  public ngOnChanges(): void {
    this.parsedBody = this.parseBody(this.body);
    if (this.parsedBody === undefined) {
      this.determineNonParsableType();
    } else {
      this.selectedTab = this.parsedLabel;
    }
  }

  private parseBody(body: string | undefined): Json | undefined {
    try {
      return JSON.parse(body!);
    } catch (e) {
      return undefined;
    }
  }

  public isParsable(): boolean {
    return this.parsedBody !== undefined;
  }

  private determineNonParsableType(): void {
    if (this.body === '') {
      this.icon = IconType.Empty;
      this.title = 'Empty';
      this.description = '';
    } else if (this.body !== undefined) {
      this.icon = IconType.Unavailable;
      this.title = 'Unavailable';
      this.description = 'Unable to parse as valid JSON';
    }
  }
}
