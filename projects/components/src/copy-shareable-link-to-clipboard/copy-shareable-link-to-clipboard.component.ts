import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { NavigationService, TimeRangeService } from '@hypertrace/common';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ButtonSize } from '../button/button';

@Component({
  selector: 'ht-copy-shareable-link-to-clipboard',
  styleUrls: ['./copy-shareable-link-to-clipboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shareable-link" htTooltip="Copy shareable url link to clipboard">
      <ht-copy-to-clipboard
        [size]="this.size"
        icon="${IconType.Share}"
        [text]="this.shareableUrl$ | async"
      ></ht-copy-to-clipboard>
    </div>
  `
})
export class CopyShareableLinkToClipboardComponent implements OnInit {
  @Input()
  public size?: ButtonSize = ButtonSize.Small;

  public shareableUrl$?: Observable<string>;

  public constructor(
    private readonly navigationService: NavigationService,
    private readonly timeRangeService: TimeRangeService
  ) {}

  public ngOnInit(): void {
    this.shareableUrl$ = merge(this.navigationService.navigation$, this.timeRangeService.getTimeRangeAndChanges()).pipe(
      map(() => this.timeRangeService.getShareableCurrentUrl())
    );
  }
}
