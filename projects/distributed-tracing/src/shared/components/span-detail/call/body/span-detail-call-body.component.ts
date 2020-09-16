import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Json } from '@hypertrace/common';
import { ToggleViewMode } from '@hypertrace/components';

@Component({
  selector: 'ht-span-detail-call-body',
  styleUrls: ['./span-detail-call-body.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="call-body">
      <ht-label label="Body" class="title"></ht-label>
      <div class="content">
        <div class="toggle-button">
          <ht-toggle-button-group [(selectedLabel)]="this.selectedTab" viewMode="${ToggleViewMode.Text}">
            <ht-toggle-button [label]="this.parsedLabel"></ht-toggle-button>
            <ht-toggle-button [label]="this.rawLabel"></ht-toggle-button>
          </ht-toggle-button-group>
        </div>

        <div class="body-viewer" [ngSwitch]="this.selectedTab">
          <section *ngSwitchCase="this.parsedLabel">
            <ht-json-viewer *ngIf="this.isParsable()" [json]="this.parsedBody"> </ht-json-viewer>
            <ht-message-display
              *ngIf="!this.isParsable()"
              [icon]="this.icon"
              [title]="this.title"
              [description]="this.description"
            >
            </ht-message-display>
          </section>
          <section *ngSwitchCase="this.rawLabel">
            <pre class="pre-body">{{ this.rawBody }}</pre>
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
  public rawBody?: string;

  public icon?: IconType;
  public title?: string;
  public description?: string;

  public ngOnChanges(): void {
    this.rawBody = this.preProcess(this.body);
    this.parsedBody = this.parseBody(this.body);
    if (this.parsedBody === undefined) {
      this.determineNonParsableType();
    } else {
      this.selectedTab = this.parsedLabel;
    }
  }

  public isParsable(): boolean {
    return this.parsedBody !== undefined;
  }

  private preProcess(body?: string): string | undefined {
    return body?.replace(/\\"/g, '"');
  }

  private parseBody(body: string | undefined): Json | undefined {
    try {
      return JSON.parse(body!);
    } catch (e) {
      return undefined;
    }
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
