import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { defaultIfEmpty } from 'rxjs/operators';
import { ModalDimension, ModalSize } from '../modal/modal';
import { ModalService } from '../modal/modal.service';
import { ConfirmationModalComponent, ConfirmationModalData } from './confirmation-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  public constructor(private readonly modalService: ModalService) {}

  public confirm(config: ConfirmationModalConfig): Observable<boolean> {
    return this.modalService
      .createModal({
        size: config.size ?? ModalSize.Small,
        content: ConfirmationModalComponent,
        data: config,
        title: config.title
      })
      .closed$.pipe(defaultIfEmpty(false));
  }
}

export type ConfirmationModalConfig = ConfirmationModalData & { title?: string, size?: ModalSize | ModalDimension };
