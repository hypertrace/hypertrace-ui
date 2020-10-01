import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ButtonRole } from '../button/button';
import { ModalOverlayConfig, MODAL_DATA } from '../overlay/modal/modal';
import { ModalRef } from '../overlay/modal/modal-ref';

@Component({
  selector: 'ht-confirmation-modal',
  styleUrls: ['./confirmation-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="confirmation-modal">
      <div class="description">
        {{ this.descriptionText }}
      </div>
      <div class="controls">
        <ht-button
          label="Cancel"
          class="cancel-button"
          role="${ButtonRole.Tertiary}"
          (click)="this.onCancel()"
        ></ht-button>
        <ht-button
          [label]="this.actionButtonText"
          class="confirm-button"
          role="${ButtonRole.Additive}"
          (click)="this.onConfirmation()"
        ></ht-button>
      </div>
    </div>
  `
})
export class ConfirmationModalComponent {
  public actionButtonText?: string;
  public descriptionText?: string;

  public constructor(
    private readonly modalRef: ModalRef<boolean>,
    @Inject(MODAL_DATA) private readonly modalData: ModalOverlayConfig<ConfirmationModalData>
  ) {
    this.actionButtonText = this.modalData?.data?.confirmButtonText;
    this.descriptionText = this.modalData?.data?.descriptionText;
  }

  public onConfirmation(): void {
    this.modalRef.close(true);
  }

  public onCancel(): void {
    this.modalRef.close(false);
  }
}

export interface ConfirmationModalData {
  confirmButtonText: string;
  descriptionText: string;
}
