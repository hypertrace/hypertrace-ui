import { ChangeDetectionStrategy, Component, Inject, TemplateRef } from '@angular/core';
import { isString } from 'lodash-es';
import { ButtonRole } from '../button/button';
import { ModalRef, MODAL_DATA } from '../modal/modal';

@Component({
  selector: 'ht-confirmation-modal',
  styleUrls: ['./confirmation-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="confirmation-modal">
      <div class="description">
        <div *ngIf="this.isContentString; else this.content">
          {{ this.descriptionText }}
        </div>
      </div>
      <div class="controls">
        <ht-button [label]="this.cancelButtonLabel" role="${ButtonRole.Tertiary}" (click)="this.onCancel()"></ht-button>
        <ht-button
          [label]="this.confirmButtonLabel"
          [role]="this.confirmButtonRole"
          (click)="this.onConfirmation()"
        ></ht-button>
      </div>
    </div>
  `
})
export class ConfirmationModalComponent {
  private static readonly DEFAULT_CONFIRM_LABEL: string = 'Confirm';
  private static readonly DEFAULT_CANCEL_LABEL: string = 'Cancel';
  private static readonly DEFAULT_CONFIRM_ROLE: ButtonRole = ButtonRole.Additive;
  public readonly confirmButtonLabel: string;
  public readonly cancelButtonLabel: string;
  public readonly confirmButtonRole: ButtonRole;
  public readonly descriptionText!: string;
  public readonly content!: TemplateRef<unknown>;
  public readonly isContentString: boolean;

  public constructor(private readonly modalRef: ModalRef<boolean>, @Inject(MODAL_DATA) config: ConfirmationModalData) {
    this.confirmButtonLabel = config.confirmButtonLabel ?? ConfirmationModalComponent.DEFAULT_CONFIRM_LABEL;
    this.confirmButtonRole = config.confirmButtonRole ?? ConfirmationModalComponent.DEFAULT_CONFIRM_ROLE;
    this.cancelButtonLabel = config.cancelButtonLabel ?? ConfirmationModalComponent.DEFAULT_CANCEL_LABEL;
    this.isContentString = isString(config.content);
    if (isString(config.content)) {
      this.descriptionText = config.content as string;
    } else {
      this.content = config.content as TemplateRef<unknown>;
    }
  }

  public onConfirmation(): void {
    this.modalRef.close(true);
  }

  public onCancel(): void {
    this.modalRef.close(false);
  }
}

export interface ConfirmationModalData {
  cancelButtonLabel?: string;
  confirmButtonLabel?: string;
  confirmButtonRole?: ButtonRole;
  content: string | TemplateRef<unknown>;
}
