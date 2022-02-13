import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'ht-iframe',
  template: `<iframe width="100%" height="100%" frameBorder="0" [src]="urlSafe"></iframe>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./iframe.component.scss']
})
export class IFrameComponent implements OnInit {
  @Input() public source: string = '';
  @Input() public title?: string;
  @Input() public allow?: boolean;

  public urlSafe?: SafeResourceUrl;
  public constructor(public sanitizer: DomSanitizer) {}

  public ngOnInit(): void {
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.source);
  }
}
