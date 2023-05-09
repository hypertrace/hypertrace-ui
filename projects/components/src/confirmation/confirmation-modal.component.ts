import { ChangeDetectionStrategy, Component, Inject, TemplateRef } from '@angular/core';
import { isString } from 'lodash-es';
import { ButtonVariant } from '../button/button';
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
        <ht-button
          [label]="this.cancelButtonLabel"
          variant="${ButtonVariant.Tertiary}"
          (click)="this.onCancel()"
        ></ht-button>
        <ht-button
          [label]="this.confirmButtonLabel"
          [variant]="this.confirmButtonUse"
          (click)="this.onConfirmation()"
        ></ht-button>
      </div>
    </div>
  `
})
export class ConfirmationModalComponent {
  private static readonly DEFAULT_CONFIRM_LABEL: string = 'Confirm';
  private static readonly DEFAULT_CANCEL_LABEL: string = 'Cancel';
  private static readonly DEFAULT_CONFIRM_USE: ButtonVariant = ButtonVariant.Additive;
  public readonly confirmButtonLabel: string;
  public readonly cancelButtonLabel: string;
  public readonly confirmButtonUse: ButtonVariant;
  public readonly descriptionText!: string;
  public readonly content!: TemplateRef<unknown>;
  public readonly isContentString: boolean;

  public constructor(private readonly modalRef: ModalRef<boolean>, @Inject(MODAL_DATA) config: ConfirmationModalData) {
    this.confirmButtonLabel = config.confirmButtonLabel ?? ConfirmationModalComponent.DEFAULT_CONFIRM_LABEL;
    this.confirmButtonUse = config.confirmButtonUse ?? ConfirmationModalComponent.DEFAULT_CONFIRM_USE;
    this.cancelButtonLabel = config.cancelButtonLabel ?? ConfirmationModalComponent.DEFAULT_CANCEL_LABEL;
    this.isContentString = isString(config.content);
    if (isString(config.content)) {
      this.descriptionText = config.content;
    } else {
      this.content = config.content;
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
  confirmButtonUse?: ButtonVariant;
  content: string | TemplateRef<unknown>;
}
