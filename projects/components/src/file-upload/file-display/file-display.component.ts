import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Color } from '@hypertrace/common';
import { IconSize } from '../../icon/icon-size';
import { FileUploadState } from './file-display';

@Component({
  selector: 'ht-file-display',
  styleUrls: ['./file-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="this.file" class="file-display" [ngClass]="{ error: this.state === '${FileUploadState.Failure}' }">
      <ht-icon class="note-icon" icon="${IconType.Note}" size="${IconSize.Medium}" color="${Color.Blue4}"></ht-icon>
      <div class="file-info">
        <div class="basic-detail">
          <div class="file-name" [htTooltip]="this.file.name">{{ this.file.name }}</div>
          <div class="file-size">{{ this.file.size | htDisplayFileSize }}</div>
        </div>
      </div>
      <ng-container *ngIf="this.showState">
        <ng-container [ngSwitch]="this.state"
          ><ng-container *ngSwitchCase="'${FileUploadState.Success}'"
            ><ht-icon
              class="success-icon"
              icon="${IconType.CheckCircle}"
              color="${Color.Green5}"
            ></ht-icon></ng-container
          ><ng-container *ngSwitchCase="'${FileUploadState.Failure}'"
            ><ht-icon
              class="failure-icon"
              icon="${IconType.Alert}"
              color="${Color.Red6}"
              [htTooltip]="this.errorStateTooltipText"
            ></ht-icon></ng-container
        ></ng-container>
      </ng-container>
      <ht-icon
        *ngIf="this.showDelete"
        class="delete-icon"
        icon="${IconType.CloseCircleFilled}"
        size="${IconSize.Small}"
        color="${Color.Gray9}"
        (click)="this.onDeleteClick()"
      ></ht-icon>
    </div>
  `
})
export class FileDisplayComponent {
  @Input()
  public file?: File;

  @Input()
  public state: FileUploadState = FileUploadState.NotStarted;

  @Input()
  public showState: boolean = false;

  @Input()
  public errorStateTooltipText: string = '';

  @Output()
  public readonly deleteClick: EventEmitter<void> = new EventEmitter();

  // Only show file delete option if file upload has not started or it has resulted in failure
  public get showDelete(): boolean {
    return this.state === FileUploadState.NotStarted || this.state === FileUploadState.Failure;
  }

  public onDeleteClick(): void {
    this.deleteClick.emit();
  }
}
