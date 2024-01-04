import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Color } from '@hypertrace/common';
import { IconSize } from '../../icon/icon-size';
import {
  FileUploadEvent,
  FileUploadEventType,
  FileUploadFailureEvent,
  FileUploadProgressEvent,
} from '../file-upload.service';

@Component({
  selector: 'ht-file-display',
  styleUrls: ['./file-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="file-display-container">
      <ht-progress-bar
        *ngIf="this.latestUploadEvent?.type === '${FileUploadEventType.Progress}'"
        class="progress-bar"
        [progress]="this.getProgress()"
      ></ht-progress-bar>
      <div
        *ngIf="this.file"
        class="file-display"
        [ngClass]="{ error: this.latestUploadEvent?.type === '${FileUploadEventType.Failure}' }"
      >
        <ht-icon class="note-icon" icon="${IconType.Note}" size="${IconSize.Medium}" color="${Color.Blue4}"></ht-icon>
        <div class="file-info">
          <div class="basic-detail">
            <div class="file-name" [htTooltip]="this.file.name">{{ this.file.name }}</div>
            <div class="file-size">{{ this.file.size | htDisplayFileSize }}</div>
          </div>
        </div>
        <ng-container *ngIf="this.latestUploadEvent">
          <ng-container [ngSwitch]="this.latestUploadEvent?.type"
            ><ng-container *ngSwitchCase="'${FileUploadEventType.Success}'"
              ><ht-icon class="success-icon" icon="${IconType.CheckCircle}" color="${Color.Green5}"></ht-icon
            ></ng-container>
            <ng-container *ngSwitchCase="'${FileUploadEventType.Failure}'"
              ><ht-icon
                class="failure-icon"
                icon="${IconType.Alert}"
                color="${Color.Red6}"
                [htTooltip]="this.getError()"
              ></ht-icon>
            </ng-container>
            <ng-container *ngSwitchCase="'${FileUploadEventType.Progress}'">
              <ht-loader class="progress-icon" htTooltip="Progress"></ht-loader>
            </ng-container>
          </ng-container>
        </ng-container>
        <ht-icon
          class="delete-icon"
          *ngIf="this.showDelete"
          icon="${IconType.CloseCircleFilled}"
          size="${IconSize.Small}"
          color="${Color.Gray9}"
          (click)="this.onDeleteClick()"
        ></ht-icon>
      </div>
    </div>
  `,
})
export class FileDisplayComponent {
  @Input()
  public file?: File;

  @Input()
  public latestUploadEvent?: FileUploadEvent<unknown>;

  @Output()
  public readonly deleteClick: EventEmitter<void> = new EventEmitter();

  public get showDelete(): boolean {
    return (
      this.latestUploadEvent?.type === FileUploadEventType.Failure ||
      this.latestUploadEvent?.type === FileUploadEventType.Success
    );
  }

  public onDeleteClick(): void {
    this.deleteClick.emit();
  }

  public getError(): string {
    return (this.latestUploadEvent as FileUploadFailureEvent)?.error ?? '';
  }

  public getProgress(): number {
    return (this.latestUploadEvent as FileUploadProgressEvent)?.progress ?? 0;
  }
}
