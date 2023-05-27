import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { isNil } from 'lodash-es';
import { Observable, of, Subject } from 'rxjs';
import { delay, finalize, switchMap } from 'rxjs/operators';
import { ButtonSize, ButtonStyle, ButtonVariant } from '../button/button';
import { PopoverBackdrop, PopoverPositionType, PopoverRelativePositionLocation } from '../popover/popover';
import { PopoverRef } from '../popover/popover-ref';
import { PopoverService } from '../popover/popover.service';

@Component({
  selector: 'ht-copy-to-clipboard',
  styleUrls: ['./copy-to-clipboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-event-blocker event="click">
      <div class="ht-copy-to-clipboard" [htTooltip]="this.tooltip" (click)="this.onCopyToClipboard()">
        <ht-button
          class="icon"
          [variant]="this.variant"
          [icon]="this.icon"
          [display]="this.display"
          [size]="this.size"
          [label]="this.label"
          [ariaLabel]="this.icon"
        ></ht-button>
      </div>
    </ht-event-blocker>
    <ng-template #notification>
      <div class="notification"><span class="label">Copied!</span></div>
    </ng-template>
  `
})
export class CopyToClipboardComponent implements OnInit, OnDestroy {
  @Input()
  public variant: ButtonVariant = ButtonVariant.Primary;

  @Input()
  public display: ButtonStyle = ButtonStyle.Text;

  @Input()
  public size?: ButtonSize = ButtonSize.Small;

  @Input()
  public icon?: IconType = IconType.ContentCopy;

  @Input()
  public label?: string = 'Copy to Clipboard';

  @Input()
  public tooltip?: string = 'Copy to Clipboard';

  @Input()
  public text?: string;

  @Input()
  public tooltipDuration: number = 3000;

  @Output()
  public readonly copiedChanges: EventEmitter<boolean> = new EventEmitter();

  @ViewChild('notification', { static: true })
  public notificationTemplate!: TemplateRef<unknown>;

  private readonly notificationSubject: Subject<void> = new Subject();

  public constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly popoverService: PopoverService,
    private readonly elementRef: ElementRef
  ) {}

  public ngOnInit(): void {
    // On every emit, Switch map will dismiss any currently opened popover by unsubscribing to the buildPopover observable.
    // The observable would show the popover on init and it would close it after a delay of 3 seconds.
    this.notificationSubject.pipe(switchMap(() => this.buildPopover())).subscribe();
  }

  public ngOnDestroy(): void {
    this.notificationSubject.complete();
  }

  public onCopyToClipboard(): void {
    if (isNil(this.text)) {
      this.copiedChanges.next(false);

      return;
    }

    const dummyTextElement = this.buildTextAreaElement(this.text);
    this.copyFromElement(dummyTextElement);
  }

  private buildTextAreaElement(text: string): HTMLTextAreaElement {
    const element = this.document.createElement('textarea');
    element.style.position = 'fixed';
    element.style.left = '0';
    element.style.top = '0';
    element.style.opacity = '0';
    element.value = text;

    this.document.body.appendChild(element);

    element.focus();
    element.select();

    return element;
  }

  private copyFromElement(element: HTMLTextAreaElement): void {
    this.document.execCommand('copy');
    this.document.body.removeChild(element);
    this.copiedChanges.emit(true);
    this.notificationSubject.next();
  }

  private buildPopover(): Observable<PopoverRef> {
    const popoverRef = this.popoverService.drawPopover({
      position: {
        type: PopoverPositionType.Relative,
        origin: this.elementRef,
        locationPreferences: [PopoverRelativePositionLocation.AboveCentered]
      },
      componentOrTemplate: this.notificationTemplate,
      backdrop: PopoverBackdrop.None
    });

    return of(popoverRef).pipe(
      delay(this.tooltipDuration ?? 0),
      finalize(() => popoverRef.close())
    );
  }
}
