import { ChangeDetectionStrategy, Component, Inject, TemplateRef } from '@angular/core';
import { ButtonRole } from '../button/button';
import { ModalRef, MODAL_DATA } from '../modal/modal';

@Component({
  selector: 'ht-confirmation-modal',
  styleUrls: ['./confirmation-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="confirmation-modal">
      <div class="description">
        <div *ngIf="this.descriptionText; else templateRenderer" class="text">{{ this.descriptionText }}</div>
        <ng-template #templateRenderer>
          <ng-container *ngTemplateOutlet="this.renderer; context: this.rendererContext"></ng-container>
        </ng-template>
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
  public readonly descriptionText: string;
  public readonly renderer?: TemplateRef<unknown>;
  public rendererContext: unknown;

  public constructor(private readonly modalRef: ModalRef<boolean>, @Inject(MODAL_DATA) config: ConfirmationModalData) {
    this.confirmButtonLabel = config.confirmButtonLabel ?? ConfirmationModalComponent.DEFAULT_CONFIRM_LABEL;
    this.confirmButtonRole = config.confirmButtonRole ?? ConfirmationModalComponent.DEFAULT_CONFIRM_ROLE;
    this.cancelButtonLabel = config.cancelButtonLabel ?? ConfirmationModalComponent.DEFAULT_CANCEL_LABEL;
    this.descriptionText = config.descriptionText ?? '';
    this.renderer = config.content;
    this.rendererContext = MODAL_DATA;
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
  descriptionText?: string;
  content?: TemplateRef<unknown>;
}
