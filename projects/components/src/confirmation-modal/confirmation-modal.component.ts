import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ButtonRole } from '../button/button';
import { ModalOverlayConfig } from '../overlay/modal/modal';
import { ModalRef } from '../overlay/modal/modal-ref';
import { POPOVER_DATA } from '../popover/popover';

@Component({
  selector: 'lib-confirmation-modal',
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
    private readonly modalRef: ModalRef,
    @Inject(POPOVER_DATA) private readonly popoverData: ModalOverlayConfig<ConfirmationModalData>
  ) {
    this.actionButtonText = this.popoverData?.data?.confirmButtonText;
    this.descriptionText = this.popoverData?.data?.descriptionText;
  }

  public onConfirmation(): void {
    console.log('Confirm clicked');
    this.modalRef.output({ proceed: true });
    this.modalRef.close();
  }

  public onCancel(): void {
    this.modalRef.output({ proceed: false });
    this.modalRef.close();
  }
}

export interface ConfirmationModalData {
  confirmButtonText: string;
  descriptionText: string;
}

export interface ConfirmationModalInteractionResponse {
  proceed: boolean;
}
